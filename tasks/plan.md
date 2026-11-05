# Implementation Plan: Wattera MVP

## Overview

Membangun Wattera dari Fase 0 sampai MVP internal: PWA mobile untuk Kios Virtual, capture foto/suara, estimasi energi, rekomendasi, laporan, trial, dan Plus. Pekerjaan dilacak sebagai GitHub Issues di GitHub Project; dokumen ini adalah indeks dan catatan keputusan, bukan duplikat issue.

**Target:** MVP internal akhir Februari 2027, pilot Maret–April 2027, Demo Day Mei 2027.

**Board:** <https://github.com/users/MahdiHbb1/projects/3> · **Issues:** <https://github.com/MahdiHbb1/wattera/issues> · **Milestones:** <https://github.com/MahdiHbb1/wattera/milestones>

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
| [ADR-001](../docs/decisions/ADR-001-pwa-capacitor.md) | PWA React/Next.js + Capacitor | Proposed (O1) |
| [ADR-002](../docs/decisions/ADR-002-modular-monolith.md) | Modular monolith TypeScript/NestJS + PostgreSQL/Redis/S3 | Proposed (O17) |
| [ADR-003](../docs/decisions/ADR-003-energy-calc-single-source.md) | Satu `energy-calc`; LLM tidak menghasilkan angka | Accepted |

## Task index

Issue GitHub adalah sumber status. Tabel ini hanya indeks urutan kerja; `WAT-xx` adalah kunci PRD yang sama dengan nomor issue.

**Catatan penjadwalan:** `energy-calc` core P5 dimajukan ke S2 (WAT-21), dan estimate/rekomendasi v0 masuk S3 (WAT-27), agar Laporan Pertama di S4 sudah memakai perhitungan nyata, bukan angka mock.

### Fase 0 — Validasi (Nov 2026–Jan 2027) · 16 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-01 | [#1 Wawancara 30 UMKM + sintesis](https://github.com/MahdiHbb1/wattera/issues/1) | Tim | P1 | 8 |
| WAT-02 | [#2 Dataset D-OCR/D-STT + label evaluasi](https://github.com/MahdiHbb1/wattera/issues/2) | Yusri | P0 | 8 |

### S1 — Fondasi & Kontrak (9–22 Nov 2026) · 24 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-03 | [#3 Fondasi monorepo, workspace, CI](https://github.com/MahdiHbb1/wattera/issues/3) | Mahdi | P0 | 3 |
| WAT-04 | [#4 Bekukan C1–C6 v0 + OpenAPI](https://github.com/MahdiHbb1/wattera/issues/4) | Mahdi | P0 | 3 |
| WAT-05 | [#5 Spike O1/O4/O17](https://github.com/MahdiHbb1/wattera/issues/5) | Mahdi | P0 | 1 |
| WAT-06 | [#6 Shell FE, design token, PWA](https://github.com/MahdiHbb1/wattera/issues/6) | Dhifansa | P0 | 3 |
| WAT-07 | [#7 Prototipe Kios Virtual 1 template](https://github.com/MahdiHbb1/wattera/issues/7) | Dhifansa | P0 | 4 |
| WAT-08 | [#8 AI Gateway mock + fixture gagal](https://github.com/MahdiHbb1/wattera/issues/8) | Mahdi | P0 | 3 |
| WAT-09 | [#9 Fondasi QA + Playwright + smoke CI](https://github.com/MahdiHbb1/wattera/issues/9) | Yusri | P0 | 2 |
| WAT-10 | [#10 Inventaris placeholder AI + matriks live T0–T5](https://github.com/MahdiHbb1/wattera/issues/10) | Muchsin | P1 | 2 |
| WAT-11 | [#11 Katalog template v0 + verifikasi sumber](https://github.com/MahdiHbb1/wattera/issues/11) | Dhifansa | P1 | 3 |

**Checkpoint S1:** kontrak beku, CI hijau, FE dan BE dapat bekerja paralel dari mock.

### S2 — Akun & Shell Game (23 Nov–6 Des 2026) · 31 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-12 | [#12 Contract test C1–C6 di CI](https://github.com/MahdiHbb1/wattera/issues/12) | Yusri | P0 | 2 |
| WAT-13 | [#13 FE mode tamu + klaim akun](https://github.com/MahdiHbb1/wattera/issues/13) | Dhifansa | P0 | 3 |
| WAT-14 | [#14 BE auth OTP + merge tamu + consent](https://github.com/MahdiHbb1/wattera/issues/14) | Mahdi | P0 | 4 |
| WAT-15 | [#15 BE profil usaha + tarif + tipe pembayaran](https://github.com/MahdiHbb1/wattera/issues/15) | Mahdi | P0 | 3 |
| WAT-16 | [#16 BE entitlement + guard server](https://github.com/MahdiHbb1/wattera/issues/16) | Mahdi | P0 | 3 |
| WAT-17 | [#17 Integrasi shell game + personalisasi](https://github.com/MahdiHbb1/wattera/issues/17) | Dhifansa | P1 | 3 |
| WAT-18 | [#18 FE M1 foto label + koreksi](https://github.com/MahdiHbb1/wattera/issues/18) | Dhifansa | P0 | 3 |
| WAT-19 | [#19 BE M1 capture label + OCR mock](https://github.com/MahdiHbb1/wattera/issues/19) | Mahdi | P0 | 3 |
| WAT-20 | [#20 QA E2E auth/klaim/entitlement](https://github.com/MahdiHbb1/wattera/issues/20) | Yusri | P1 | 2 |
| WAT-21 | [#21 energy-calc core P5 + golden test](https://github.com/MahdiHbb1/wattera/issues/21) | Mahdi | P0 | 5 |

**Checkpoint S2:** pengguna tamu dapat mengklaim progres; entitlement tidak bisa dibypass dari FE; mesin hitung P5 lulus golden test.

### S3 — Capture & Antrean (7–20 Des 2026) · 26 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-22 | [#22 BE capture upload + storage + status job](https://github.com/MahdiHbb1/wattera/issues/22) | Mahdi | P0 | 4 |
| WAT-23 | [#23 FE kamera/unggah + fallback manual](https://github.com/MahdiHbb1/wattera/issues/23) | Dhifansa | P0 | 4 |
| WAT-24 | [#24 FE antrean offline + retry](https://github.com/MahdiHbb1/wattera/issues/24) | Dhifansa | P0 | 3 |
| WAT-25 | [#25 FE konfirmasi/koreksi + label evaluasi](https://github.com/MahdiHbb1/wattera/issues/25) | Dhifansa | P0 | 3 |
| WAT-26 | [#26 BE M2 meter + anti-curang](https://github.com/MahdiHbb1/wattera/issues/26) | Mahdi | P0 | 4 |
| WAT-27 | [#27 Estimate v0 + rekomendasi v0](https://github.com/MahdiHbb1/wattera/issues/27) | Muchsin | P0 | 5 |
| WAT-28 | [#28 QA capture E2E + matriks 5 perangkat](https://github.com/MahdiHbb1/wattera/issues/28) | Yusri | P0 | 3 |

**Checkpoint S3:** foto/suara masuk antrean, diproses, dikonfirmasi, dan menjadi data berlabel; estimate v0 tersedia untuk laporan.

### S4 — Trial & Laporan Pertama (21 Des 2026–3 Jan 2027) · 17 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-29 | [#29 BE trial engine 30 hari + reminder H-25](https://github.com/MahdiHbb1/wattera/issues/29) | Mahdi | P0 | 3 |
| WAT-30 | [#30 FE Laporan Pertama Hari 7 + share PDF/gambar](https://github.com/MahdiHbb1/wattera/issues/30) | Dhifansa | P0 | 4 |
| WAT-31 | [#31 BE notifikasi opt-in + batas harian](https://github.com/MahdiHbb1/wattera/issues/31) | Mahdi | P1 | 2 |
| WAT-32 | [#32 AI OCR live P1–P3 + gate kualitas](https://github.com/MahdiHbb1/wattera/issues/32) | Muchsin | P0 | 5 |
| WAT-33 | [#33 QA E2E trial + Laporan Pertama](https://github.com/MahdiHbb1/wattera/issues/33) | Yusri | P0 | 3 |

### S5 — OCR/STT Live & Admin (4–17 Jan 2027) · 16 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-34 | [#34 AI STT live P4 + ekstraksi + konfirmasi](https://github.com/MahdiHbb1/wattera/issues/34) | Muchsin | P0 | 4 |
| WAT-35 | [#35 BE admin API v0 (funnel, akurasi, biaya)](https://github.com/MahdiHbb1/wattera/issues/35) | Mahdi | P1 | 3 |
| WAT-36 | [#36 FE admin UI v0](https://github.com/MahdiHbb1/wattera/issues/36) | Dhifansa | P1 | 3 |
| WAT-37 | [#37 QA harness evaluasi akurasi OCR/STT](https://github.com/MahdiHbb1/wattera/issues/37) | Yusri | P0 | 3 |
| WAT-38 | [#38 AI cost guardrails + kuota + cache + `ai_usage`](https://github.com/MahdiHbb1/wattera/issues/38) | Muchsin | P1 | 3 |

**Checkpoint S5:** gerbang OCR ≥90% dan STT ≥85% terukur pada dataset awal.

### S6 — Estimasi, Rekomendasi & Privasi (18–31 Jan 2027) · 23 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-39 | [#39 Cross-validation P6 + tampilan keyakinan](https://github.com/MahdiHbb1/wattera/issues/39) | Mahdi | P0 | 4 |
| WAT-40 | [#40 Rekomendasi v1 + keputusan + cooldown](https://github.com/MahdiHbb1/wattera/issues/40) | Muchsin | P0 | 3 |
| WAT-41 | [#41 FE rekomendasi + decision tracking](https://github.com/MahdiHbb1/wattera/issues/41) | Dhifansa | P0 | 3 |
| WAT-42 | [#42 FE Laporan Hasil Hari 30 + pisah tarif/volume](https://github.com/MahdiHbb1/wattera/issues/42) | Dhifansa | P0 | 4 |
| WAT-43 | [#43 BE privasi + lihat/hapus akun dan data](https://github.com/MahdiHbb1/wattera/issues/43) | Mahdi | P0 | 3 |
| WAT-44 | [#44 AI P8 explainer validator tanpa angka baru](https://github.com/MahdiHbb1/wattera/issues/44) | Muchsin | P0 | 3 |
| WAT-45 | [#45 QA kalkulasi golden + keyakinan + privasi](https://github.com/MahdiHbb1/wattera/issues/45) | Yusri | P0 | 3 |

**Checkpoint S6:** estimasi, rekomendasi, laporan, dan hapus data berjalan end-to-end; tidak ada angka baru dari LLM.

### S7–S8 — Plus, Hardening & MVP Internal (Februari 2027) · 15 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-46 | [#46 BE Plus subscription + payment provider](https://github.com/MahdiHbb1/wattera/issues/46) | Mahdi | P0 | 5 |
| WAT-47 | [#47 FE paywall/upgrade + locked states](https://github.com/MahdiHbb1/wattera/issues/47) | Dhifansa | P0 | 3 |
| WAT-48 | [#48 Hardening keamanan + akses data](https://github.com/MahdiHbb1/wattera/issues/48) | Mahdi | P0 | 3 |
| WAT-49 | [#49 QA regression penuh + MVP release gate](https://github.com/MahdiHbb1/wattera/issues/49) | Yusri | P0 | 4 |

**Checkpoint MVP:** seluruh gate di `docs/ROADMAP.md` lulus; demo internal siap.

### Pilot (Mar–Apr 2027) · 19 hari

| ID | Issue | Owner | Prioritas | Est. |
|---|---|---|---|---|
| WAT-50 | [#50 AI P10 Tanya Wati + sources + tool terbatas](https://github.com/MahdiHbb1/wattera/issues/50) | Muchsin | P1 | 5 |
| WAT-51 | [#51 AI P11–P13 alert, prediksi token, ROI](https://github.com/MahdiHbb1/wattera/issues/51) | Muchsin | P1 | 5 |
| WAT-52 | [#52 Sensor pembanding 2–3 usaha + kalibrasi ambang](https://github.com/MahdiHbb1/wattera/issues/52) | Mahdi | P1 | 4 |
| WAT-53 | [#53 QA lapangan + kualitas data + anti-curang](https://github.com/MahdiHbb1/wattera/issues/53) | Yusri | P0 | 5 |

**Total estimasi seluruh fase: 187 hari kerja fokus** (bukan durasi kalender; beberapa orang bekerja paralel).

## Cara memakai board

Buka [Wattera — Delivery](https://github.com/users/MahdiHbb1/projects/3).

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
| O17 | Bahasa/paket `energy-calc` | Awal S2 | Mahdi |
| O30 | Nilai `hybrid` di feature flag | Akhir S1 | Mahdi |
| O31 | OpenAPI lengkap P2/P3 | Sebelum live OCR | Mahdi/Muchsin |
| O32 | Bentuk API P11–P13 | Sebelum pilot | Mahdi/Muchsin |
| O33 | Target kuantitatif funnel/retensi | Sebelum pilot | Tim |

Daftar lengkap ada di PRD Bagian 17.2. Jangan mengisi `[X]` dengan asumsi tanpa mencatat keputusan.

## Catatan

- PRD dipindahkan ke `docs/PRD.md` dari `Wattera PRD Terpadu v0.3.1.md`.
- Issue #1–#53 dibuat dari PRD v0.3.1 dan seluruhnya masuk [Project #3](https://github.com/MahdiHbb1/projects/3); `WAT-xx` = nomor issue.
- Assignee GitHub baru diisi untuk Mahdi; Dhifansa, Muchsin, dan Yusri dilacak lewat label `owner:*` dan field **Owner** sampai username GitHub mereka tersedia.
- Bila PRD berubah, buka issue `contract-change`/`docs` dan perbarui indeks ini.
