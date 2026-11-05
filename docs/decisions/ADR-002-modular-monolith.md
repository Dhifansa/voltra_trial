# ADR-002: Modular monolith TypeScript dengan PostgreSQL, Redis, dan object storage

## Status
Proposed — menunggu keputusan O17 dan scaffold Sprint S1.

## Date
2026-11-05

## Context
Wattera memiliki modul auth, business, template, mission, capture, trial, billing, report, notify, admin, analytics, dan AI. Tim kecil, waktu pengembangan singkat, dan kontrak antarmodul harus tetap terjaga. PRD merekomendasikan modular monolith, dengan opsi Node.js (NestJS/Express) atau Python (FastAPI).

## Decision
Gunakan **TypeScript + NestJS** sebagai modular monolith, **PostgreSQL** sebagai database utama, **Redis + BullMQ** untuk queue/cache, dan **S3-compatible object storage** untuk foto/suara. Paket `energy-calc` dan `contracts` dibagikan dalam monorepo.

## Alternatives Considered

### Python + FastAPI
- Pros: ekosistem AI/OCR/STT kuat, pengembangan cepat.
- Cons: dua bahasa untuk FE/BE/energy-calc; berbagi tipe dan pustaka hitung lebih rumit.
- Rejected untuk saat ini: satu bahasa menyederhanakan C2 dan kontrak.

### Microservices
- Pros: batas modul tegas, scaling per layanan.
- Cons: overhead operasional, distributed transaction, observability, dan deployment untuk tim 4 orang.
- Rejected: modular monolith lebih murah dan cukup untuk pilot.

### Serverless
- Pros: operasional rendah.
- Cons: queue/job berat, koneksi DB, dan kontrol biaya AI lebih rumit; vendor lock-in.
- Rejected untuk MVP.

## Consequences
- Satu proses API dengan batas modul yang jelas; tidak ada panggilan lintas modul lewat HTTP internal.
- Queue menangani OCR, STT, estimasi, laporan, dan notifikasi.
- `packages/energy-calc` dapat dipakai FE (simulasi) dan BE (estimasi) tanpa duplikasi rumus.
- Perlu disiplin modul: tidak ada akses langsung tabel modul lain; lewat service/interface.
- Bila skala menuntut, modul dapat dipisah tanpa mengubah kontrak eksternal.

## Revisit trigger
Setelah pilot, bila beban AI/queue atau kebutuhan scaling tidak lagi cocok dengan satu proses, evaluasi pemisahan layanan AI/worker.
