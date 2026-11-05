# Implementation Plan: Wattera MVP

## Overview

Membangun Wattera dari Fase 0 sampai MVP internal: PWA mobile untuk Kios Virtual, capture foto/suara, estimasi energi, rekomendasi, laporan, trial, dan Plus. Pekerjaan dilacak sebagai GitHub Issues di GitHub Project; dokumen ini adalah indeks dan catatan keputusan, bukan duplikat issue.

**Target:** MVP internal akhir Februari 2027, pilot Maret–April 2027, Demo Day Mei 2027.

## Strategi delivery

- **Contract-first.** C1–C6 dibekukan di S1; FE/BE bekerja paralel dari kontrak dan fixture mock.
- **Vertical slice.** Setiap sprint menghasilkan alur yang bisa didemokan, bukan lapisan horizontal.
- **Mock tidak memblokir FE.** AI Gateway mock menyediakan sukses, keyakinan rendah, dan gagal.
- **Satu mesin hitung.** `energy-calc` dikerjakan sebelum estimasi/rekomendasi/laporan.
- **QA sejak awal.** Contract test dan E2E masuk CI sejak S1; QA dapat memblokir gate P0.
- **Feature flag per endpoint AI.** Mock/hybrid/live dikendalikan konfigurasi, bukan branch panjang.

## Keputusan arsitektur

| ADR | Keputusan | Status |
|---|---|---|
| [ADR-001](docs/decisions/ADR-001-pwa-capacitor.md) | PWA React/Next.js + Capacitor | Proposed (O1) |
| [ADR-002](docs/decisions/ADR-002-modular-monolith.md) | Modular monolith TypeScript/NestJS + PostgreSQL/Redis/S3 | Proposed (O17) |
| [ADR-003](docs/decisions/ADR-003-energy-calc-single-source.md) | Satu `energy-calc`; LLM tidak menghasilkan angka | Accepted |

## Task index

Issue GitHub adalah sumber status. Tabel ini hanya indeks urutan kerja.

### Fase 0 — Validasi (Nov 2026–Jan 2027)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-09 | Wawancara 30 UMKM + sintesis | Tim | P1 |
| WAT-10 | Dataset D-OCR/D-STT + label evaluasi | Yusri | P0 |

### S1 — Fondasi & Kontrak (9–22 Nov 2026)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-01 | Fondasi monorepo, workspace, CI | Mahdi | P0 |
| WAT-02 | Bekukan C1–C6 v0 + OpenAPI skeleton | Mahdi | P0 |
| WAT-03 | Spike O1/O4/O17 | Mahdi | P0 |
| WAT-04 | Shell FE, design tokens, PWA | Dhifansa | P0 |
| WAT-05 | Prototipe Kios Virtual 1 template | Dhifansa | P0 |
| WAT-06 | AI Gateway mock + fixture | Mahdi | P0 |
| WAT-07 | Fondasi QA + Playwright + smoke CI | Yusri | P0 |
| WAT-08 | Inventaris placeholder + matriks live | Muchsin | P1 |
| WAT-11 | Katalog template v0 + verifikasi | Dhifansa | P1 |

**Checkpoint S1:** kontrak beku, CI hijau, FE dan BE dapat bekerja paralel dari mock.

### S2 — Akun & Shell Game (23 Nov–6 Des 2026)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-12 | Contract test C1–C6 | Yusri | P0 |
| WAT-13 | FE mode tamu + klaim akun | Dhifansa | P0 |
| WAT-14 | BE auth OTP + merge tamu + consent | Mahdi | P0 |
| WAT-15 | BE profil usaha + tarif | Mahdi | P0 |
| WAT-16 | BE entitlement + guard server | Mahdi | P0 |
| WAT-17 | Integrasi shell game + personalisasi | Dhifansa | P1 |
| WAT-18 | FE M1 foto label + koreksi | Dhifansa | P0 |
| WAT-19 | BE M1 capture label + OCR mock | Mahdi | P0 |
| WAT-20 | QA E2E auth/klaim/entitlement | Yusri | P1 |

**Checkpoint S2:** pengguna tamu dapat mengklaim progres; entitlement tidak bisa dibypass dari FE.

### S3 — Capture & Antrean (7–20 Des 2026)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-21 | BE upload + storage + status job | Mahdi | P0 |
| WAT-22 | FE kamera/unggah + fallback manual | Dhifansa | P0 |
| WAT-23 | FE antrean offline + retry | Dhifansa | P0 |
| WAT-24 | FE konfirmasi/koreksi + label evaluasi | Dhifansa | P0 |
| WAT-25 | BE M2 meter + anti-curang | Mahdi | P0 |
| WAT-26 | QA capture E2E 5 perangkat | Yusri | P0 |

**Checkpoint S3:** foto/suara masuk antrean, diproses, dikonfirmasi, dan menjadi data berlabel.

### S4 — Trial & Laporan Pertama (21 Des 2026–3 Jan 2027)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-27 | BE trial engine + reminder H-25 | Mahdi | P0 |
| WAT-28 | FE Laporan Pertama Hari 7 + share | Dhifansa | P0 |
| WAT-29 | BE notifikasi opt-in + batas harian | Mahdi | P1 |
| WAT-30 | AI OCR live P1–P3 + gate kualitas | Muchsin | P0 |
| WAT-31 | QA E2E trial + Laporan Pertama | Yusri | P0 |

### S5 — OCR/STT Live & Admin (4–17 Jan 2027)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-32 | AI STT live P4 + ekstraksi | Muchsin | P0 |
| WAT-33 | BE admin API v0 | Mahdi | P1 |
| WAT-34 | FE admin UI v0 | Dhifansa | P1 |
| WAT-35 | QA evaluasi akurasi OCR/STT | Yusri | P0 |
| WAT-36 | AI cost guardrails + `ai_usage` | Muchsin | P1 |

**Checkpoint S5:** gerbang OCR ≥90% dan STT ≥85% terukur pada dataset awal.

### S6 — Estimasi, Rekomendasi & Privasi (18–31 Jan 2027)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-37 | `energy-calc` P5/P6 + golden test | Mahdi | P0 |
| WAT-38 | BE estimate + cross-validation | Mahdi | P0 |
| WAT-39 | BE rekomendasi P7 + keputusan | Mahdi | P0 |
| WAT-40 | FE rekomendasi + decision tracking | Dhifansa | P0 |
| WAT-41 | FE Laporan Hasil Hari 30 | Dhifansa | P0 |
| WAT-42 | BE privasi + hapus akun/data | Mahdi | P0 |
| WAT-43 | AI P8 explainer validator | Muchsin | P0 |
| WAT-44 | QA golden/confidence/privasi E2E | Yusri | P0 |

**Checkpoint S6:** estimasi, rekomendasi, laporan, dan hapus data berjalan end-to-end; tidak ada angka baru dari LLM.

### S7–S8 — Plus, Hardening & MVP Internal (Februari 2027)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-45 | BE Plus + payment provider | Mahdi | P0 |
| WAT-46 | FE paywall/upgrade + locked states | Dhifansa | P0 |
| WAT-47 | Hardening keamanan | Mahdi | P0 |
| WAT-48 | QA regression + MVP release gate | Yusri | P0 |

**Checkpoint MVP:** seluruh gate di `docs/ROADMAP.md` lulus; demo internal siap.

### Pilot (Mar–Apr 2027)

| ID | Issue | Owner | Prioritas |
|---|---|---|---|
| WAT-49 | AI P10 Tanya Wati + sources | Muchsin | P1 |
| WAT-50 | AI P11–P13 alert/token/ROI | Muchsin | P1 |
| WAT-51 | Sensor pilot + kalibrasi ambang | Mahdi | P1 |
| WAT-52 | QA pilot lapangan | Yusri | P0 |

## Cara memakai board

- **Status:** `Backlog → Ready → In Progress → In Review → Blocked → Done`.
- **Owner:** Dhifansa, Mahdi, Muchsin, Yusri, atau Tim.
- **Workstream:** Frontend, Gamifikasi, Backend, AI/Energi, AI Subscription, QA/E2E, Docs/PM.
- **Sprint:** Fase 0, S1–S6, S7–S8, Pilot.
- **Priority:** P0 = memblokir gate; P1 = penting; P2 = opsional.
- **Estimate:** perkiraan hari kerja fokus (bukan deadline).
- Pindahkan ke **Done** hanya setelah acceptance criteria, CI, dan QA gate (bila relevan) lulus.

## Risiko utama

| Risiko | Dampak | Mitigasi | Owner |
|---|---|---|---|
| Kontrak bergeser saat FE/BE paralel (R13) | Tinggi | Bekukan C1–C6 di S1, contract test di CI, perubahan lewat PR | Mahdi/Yusri |
| Mock terlalu bagus dan menyesatkan (R14) | Tinggi | Fixture gagal/low-confidence, label **Contoh**, larangan mock di pilot | Mahdi/Muchsin |
| OCR/STT di bawah gate | Tinggi | Dataset ≥50, evaluasi S5, fallback manual, tunda live | Muchsin/Yusri |
| Estimasi meleset tanpa sensor (R1) | Tinggi | Label estimasi, keyakinan, tampilan kategori, kalibrasi pilot | Mahdi |
| Biaya AI melebihi harga Plus (R6/R20) | Tinggi | Kuota, cache, batch, `ai_usage`, model murah untuk ekstraksi | Muchsin |
| Kamera/mikrofon PWA berbeda (R19) | Sedang | Uji 5 perangkat, unggah galeri, input manual | Dhifansa/Yusri |
| Pembayaran butuh verifikasi bisnis (R18) | Sedang | Mulai pendaftaran S3, mode uji untuk demo | Mahdi |
| Pengguna tidak disiplin mengisi (R7) | Sedang | Input ≤2 menit, misi pendek, pengingat opt-in | Dhifansa |
| Data pribadi bocor (R9) | Tinggi | Authz `business_id`, signed URL, retensi, hapus data | Mahdi/Yusri |
| Scope melebar ke sensor/multi-kios | Sedang | Scope guard roadmap; sensor hanya pilot | Seluruh tim |

## Keputusan terbuka yang perlu segera

| ID | Keputusan | Deadline | Owner |
|---|---|---|---|
| O1 | Platform: PWA+Capacitor vs RN/Expo vs Flutter | Akhir S1 | Dhifansa/Mahdi |
| O4 | Engine game | Awal S2 | Dhifansa |
| O15 | Penyedia OCR/STT/LLM | Awal S4 | Muchsin |
| O17 | Bahasa/paket `energy-calc` | Awal S6 | Mahdi |
| O30 | Nilai `hybrid` di feature flag | Akhir S1 | Mahdi |
| O31 | OpenAPI lengkap P2/P3 | Sebelum live OCR | Mahdi/Muchsin |
| O32 | Bentuk API P11–P13 | Sebelum pilot | Mahdi/Muchsin |
| O33 | Target kuantitatif funnel/retensi | Sebelum pilot | Tim |

Daftar lengkap ada di PRD Bagian 17.2. Jangan mengisi `[X]` dengan asumsi tanpa mencatat keputusan.

## Catatan

- PRD dipindahkan ke `docs/PRD.md` dari `Wattera PRD Terpadu v0.3.1.md`.
- Issue dibuat dari PRD v0.3.1; bila PRD berubah, buka issue `contract-change`/`docs` dan perbarui indeks ini.
