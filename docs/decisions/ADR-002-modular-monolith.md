# ADR-002: Modular monolith TypeScript dengan PostgreSQL, Redis, dan object storage

## Status

Accepted — O17 dikunci 2026-11-06; scaffold mengikuti keputusan ini pada issue #3.

## Date

2026-11-05 (diputuskan 2026-11-06)

## Context

Voltra memiliki modul auth, business, template, mission, capture, trial, billing, report, notify, admin, analytics, dan AI. Tim kecil, waktu pengembangan singkat, dan kontrak antarmodul harus tetap terjaga. PRD merekomendasikan modular monolith, dengan opsi Node.js (NestJS/Express) atau Python (FastAPI).

## Decision

Gunakan **TypeScript + NestJS** sebagai modular monolith, **PostgreSQL** sebagai database utama, **Redis + BullMQ** untuk queue/cache, dan **S3-compatible object storage** untuk foto/suara. Paket `energy-calc` dan `contracts` dibagikan dalam monorepo sebagai paket TypeScript.

Keputusan O17: `energy-calc` adalah **paket TypeScript** `@voltra/energy-calc`, bukan layanan terpisah. FE memakainya untuk simulasi dan BE memakainya untuk estimasi; keduanya mengimpor kode yang sama sehingga rumus tidak diduplikasi. Rincian ada di ADR-003.

Batas modul:

- Setiap modul memiliki service/interface sendiri; tidak ada akses langsung ke tabel modul lain.
- Komunikasi antar-modul lewat pemanggilan fungsi internal, bukan HTTP internal.
- Kontrak eksternal (C1–C6) tetap menjadi batas yang stabil bila modul dipecah di masa depan.

## Alternatives Considered

### Python + FastAPI
- Pros: ekosistem AI/OCR/STT kuat, pengembangan cepat.
- Cons: dua bahasa untuk FE/BE/energy-calc; berbagi tipe dan pustaka hitung lebih rumit.
- Rejected: satu bahasa menyederhanakan C2 dan kontrak.

### Microservices
- Pros: batas modul tegas, scaling per layanan.
- Cons: overhead operasional, distributed transaction, observability, dan deployment untuk tim 4 orang.
- Rejected: modular monolith lebih murah dan cukup untuk pilot.

### Serverless
- Pros: operasional rendah.
- Cons: queue/job berat, koneksi DB, dan kontrol biaya AI lebih rumit; vendor lock-in.
- Rejected untuk MVP.

## Consequences

- Satu proses API dengan batas modul yang jelas.
- Queue menangani OCR, STT, estimasi, laporan, dan notifikasi.
- `packages/energy-calc` dapat dipakai FE (simulasi) dan BE (estimasi) tanpa duplikasi rumus.
- Perlu disiplin modul: tidak ada akses langsung tabel modul lain; lewat service/interface.
- Build dan test harus menjaga urutan dependensi workspace: `contracts`/`energy-calc` lebih dulu, lalu `api`/`web`.
- Bila skala menuntut, modul dapat dipisah tanpa mengubah kontrak eksternal.

## Revisit trigger

Setelah pilot, bila beban AI/queue atau kebutuhan scaling tidak lagi cocok dengan satu proses, evaluasi pemisahan layanan AI/worker. Pemisahan `energy-calc` menjadi layanan hanya dipertimbangkan bila ada kebutuhan keamanan atau distribusi yang tidak bisa dipenuhi paket TypeScript.
