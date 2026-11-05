# Roadmap dan Rencana Rilis

Sumber tanggal: PRD v0.3.1 Bagian 16. Tanggal bersifat indikatif dan bergantung pada kapasitas 4 orang serta keputusan platform.

## Target utama

| Tonggak | Target |
|---|---|
| AI diuji dengan data nyata | paling lambat Januari 2027 |
| Pilot berbayar | paling lambat April 2027 |
| Demo Day | Mei 2027 |

## Fase produk

| Fase | Periode | Aplikasi sistem | Gamifikasi | AI/energi |
|---|---|---|---|---|
| **0 — Validasi** | Nov 2026–Jan 2027 | Kerangka aplikasi, auth, AI mock | Prototipe Kios Virtual 1 template | ≥50 foto meter, ≥50 voice note, uji OCR/STT, katalog 3 template |
| **1 — MVP** | Jan–Feb 2027 | Trial, laporan, notifikasi, admin dasar | 3 template, M1–M4, level | Estimasi + cross-validation v0, rekomendasi v0, AI live bertahap |
| **2 — Pilot berbayar** | Mar–Apr 2027 | Plus dan pembayaran | Hadiah nyata, uji retensi | Sensor pembanding 2–3 usaha, alert, token, ROI, Tanya Wati |
| **3 — Lanjutan** | Setelah Mei 2027 | Multi-kios | Template tambahan | Sensor/AMI, sponsor |

## Sprint

| Sprint | Periode | Milestone GitHub | Hasil yang harus terlihat |
|---|---|---|---|
| **S1** | 9–22 Nov 2026 | `S1 — Fondasi & Kontrak` | Monorepo/CI, auth OTP skeleton, shell FE, AI Gateway mock, kontrak C1–C6 v0 beku |
| **S2** | 23 Nov–6 Des 2026 | `S2 — Akun & Shell Game` | Mode tamu + klaim, profil usaha, entitlement, shell game terintegrasi |
| **S3** | 7–20 Des 2026 | `S3 — Capture & Antrean` | Kamera/unggah, antrean offline, status job, koreksi, M1/M2 |
| **S4** | 21 Des 2026–3 Jan 2027 | `S4 — Trial & Laporan Pertama` | Trial engine, Laporan Pertama, transisi OCR live, notifikasi |
| **S5** | 4–17 Jan 2027 | `S5 — OCR/STT Live & Admin` | OCR/STT live, admin dasar, uji akurasi, biaya AI |
| **S6** | 18–31 Jan 2027 | `S6 — Estimasi, Rekomendasi & Privasi` | Estimasi + cross-validation live, rekomendasi, Laporan Hasil, hapus data |
| **S7–S8** | Februari 2027 | `S7–S8 — Plus, Hardening & MVP Internal` | Pembayaran Plus, paywall, hardening, MVP internal |
| **Pilot** | Mar–Apr 2027 | `Pilot — Maret–April 2027` | Sensor pembanding, P10–P13, uji lapangan 2–3 usaha |

## Critical path

```text
Kontrak C1–C6
    |
    +--> energy-calc (C2) --> estimasi P5/P6 --> rekomendasi P7 --> laporan/verifikasi P9
    |
    +--> AI Gateway (C3) --> OCR/STT live --> data berlabel --> estimasi
    |
    +--> Auth/entitlement (C5) --> trial --> Plus --> pembayaran
    |
    +--> Template (C1) --> Kios Virtual --> capture mission (C4) --> progres game
```

Aturan eksekusi:

- Kontrak dibekukan sebelum FE/BE bekerja paralel.
- FE memakai mock; tidak menunggu AI live.
- `energy-calc` dikerjakan sebelum rekomendasi dan laporan.
- OCR/STT live tidak boleh mengubah bentuk respons kontrak.
- Pembayaran dimulai pendaftarannya sejak S3 (risiko R18), walau implementasi di S7.

## Release gate

### Gate kontrak (akhir S1)
- [ ] C1–C6 memiliki skema, contoh, pemilik, dan consumer yang jelas.
- [ ] OpenAPI v0 tersedia untuk P1–P10.
- [ ] Fixture mock untuk sukses, keyakinan rendah, dan gagal tersedia.
- [ ] Contract test minimal berjalan di CI.

### Gate MVP internal (akhir S7–S8)
- [ ] Alur tamu → trial → Laporan Pertama → saran → Laporan Hasil berjalan end-to-end.
- [ ] OCR meter ≥90% pada 50 foto; STT/ekstraksi ≥85% pada 50 pesan.
- [ ] Tidak ada angka baru dari LLM (validator 0 pelanggaran).
- [ ] Semua jawaban Tanya Wati punya `sources` atau menyatakan "belum cukup data".
- [ ] Entitlement diperiksa server; data dibatasi `business_id`.
- [ ] Pengguna dapat melihat dan menghapus akun/data.
- [ ] E2E regression lulus di 5 perangkat Android umum.
- [ ] Tidak ada klaim real-time di UI/materi demo.

### Gate pilot
- [ ] Sensor pembanding terpasang di 2–3 usaha.
- [ ] Hasil verifikasi dampak dilaporkan apa adanya, termasuk "belum terbukti".
- [ ] Biaya AI per pengguna di bawah harga Plus.
- [ ] Data D-OCR/D-STT mencukupi dan disetujui pengguna.

## Scope guard MVP

**Masuk:** 3 template + Kustom, satu kios per pengguna, Kios Virtual, M1–M4, trial 30 hari, Laporan Hari 7/Hari 30, Plus, Tanya Wati, admin dasar, privasi.

**Tidak masuk rilis awal:** sensor/IoT/AMI real-time, multi-kios, PPOB, integrasi Gmail, modul air/gas, akun karyawan penuh, sponsor/kohort aktif.
