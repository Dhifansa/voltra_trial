# Wattera — PRD v0.2 (Indeks Master)

**Versi:** 0.2 · **Tanggal:** 5 November 2026 · **Pemilik:** Tim d1306 (UNNES)
**Menggantikan:** `wattera-prd-v0.1.md` (isinya dipecah ke tiga PRD di bawah)

> Semua angka, harga, dan target adalah **hipotesis** sampai diuji ke pengguna. `[X]` = belum ditetapkan. ⚠ = perlu keputusan/pengecekan tim.

## 0. Cara membaca paket dokumen

| Dokumen | Isi | Pembaca utama |
|---|---|---|
| **Indeks ini** | Keputusan tim, pain point & alasan pengguna mau pakai, monetisasi, kontrak antar-PRD, rilis, risiko, pertanyaan terbuka | Semua |
| **PRD 1 — Aplikasi Sistem** (`wattera-prd-1-sistem-app.md`) | FE + BE + AI *placeholder*, mobile, trial/langganan, admin | Dev FE/BE |
| **PRD 2 — Gamifikasi** (`wattera-prd-2-gamifikasi.md`) | Kios Virtual (village builder), template per sub-bidang, misi, AI assistant di game | Dev game, desain |
| **PRD 3 — Integrasi AI E2E** (`wattera-prd-3-ai-e2e.md`) | Pipeline OCR→STT→estimasi→cross-validation→rekomendasi→verifikasi, kontrak data, evaluasi | Dev AI/data |

**Prinsip pemisahan:** PRD 1 memiliki platform dan akun, PRD 2 memiliki pengalaman bermain, PRD 3 memiliki semua logika angka dan AI. Ketiganya hanya berkomunikasi lewat **kontrak** di bagian 5 indeks ini.

## 1. Keputusan tim (dikunci untuk v0.2)

| # | Keputusan |
|---|---|
| K1 | Target **UMKM secara umum** (bukan hanya laundry) |
| K2 | **Game** = simulasi/onboarding **gratis**. **App sistem AI** = **trial 30 hari**, lalu berbayar untuk pemakaian jangka panjang (**fitur Plus**) |
| K3 | Game mencakup **1 kios/ruko** per pengguna, dengan **template per sub-bidang** |
| K4 | Data estimasi fisika + input pengguna = **bahan cross-validation** untuk analisis AI, dan dikemas sebagai **misi** di game |
| K5 | AI/AX ada di **sistem rekomendasi** dan asisten (Tanya Wati / "Halo Jarvis") |
| K6 | Personalisasi game gaya *village builder*; **village = ruko/kios UMKM pengguna** |
| K7 | Fokus rilis: **software saja**. AI di PRD 1 awalnya **placeholder** (mock) dan diganti AI asli sesuai PRD 3 |
| K8 | Aplikasi harus bisa dipakai di **mobile** (lihat PRD 1 §4) |

**Perubahan nama:** tingkat berbayar memakai istilah **Plus** (sebelumnya "Pro" di v0.1), sesuai istilah diskusi tim.

### ⚠ Satu hal yang perlu disepakati: "real-time" dan "Halo Jarvis lacak alat paling boros"

Tim menulis langganan untuk "analisis real-time kondisi lapangan". Tanpa sensor/AMI, software **tidak bisa** mengukur per alat secara real-time. Yang bisa dijanjikan jujur di rilis ini:

| Klaim | Status di rilis ini | Cara menyebutnya |
|---|---|---|
| Analisis hampir real-time | Ya, **setiap foto/suara baru memicu pembaruan** (detik–menit setelah input) | "Analisis langsung setelah Anda kirim data" |
| "Halo Jarvis, alat mana paling boros?" | Ya, via suara/teks, menjawab dari data pengguna, label **estimasi** + keyakinan | "Tanya Wati" |
| Pelacakan per alat 24 jam | **Tidak** tanpa sensor/AMI | Roadmap **Plus+** (Fase 3) |

Pitch sebaiknya memakai baris 1–2 dan menandai baris 3 sebagai roadmap.

## 2. Pain point: kenapa UMKM mau memakai Wattera

### 2.1 Yang sudah terbukti vs hipotesis

Bukti baru **2 wawancara** (laundry, barbershop di sekitar UNNES). Satu temuan kuat: pemilik menduga alat terbesar, tetapi **tidak tahu berapa rupiahnya, kapan boros, dan apa yang harus diubah**. Sisanya hipotesis.

### 2.2 Pain point lintas-UMKM (versi diperluas)

Untuk scope "UMKM umum", pain point diurutkan dari yang paling universal.

| # | Pain point (bahasa pemilik) | Berlaku untuk | Bukti | Fitur jawaban | Aha moment | Fase |
|---|---|---|---|---|---|---|
| PP1 | "Tagihan naik, tapi saya tidak tahu gara-gara apa." | Semua | Wawancara (2) | Estimasi per alat/jam dalam Rp | Melihat angka Rp per alat di Kios Virtual | MVP |
| PP2 | "Saya tidak mau bayar aplikasi yang belum tentu hemat." | Semua | Hipotesis | Game gratis + trial 30 hari + hasil hemat terukur | Laporan Hasil Hari 30 | MVP |
| PP3 | "Tidak sempat mencatat." | Semua | Hipotesis | Foto + suara ≤ 2 menit/hari | Satu voice note jadi data terstruktur | MVP |
| PP4 | "Saya tidak tahu harus ngapain." | Semua | Wawancara | Saran 1–3 dalam Rp dengan langkah jelas | Laporan Pertama (Hari 7) | MVP |
| PP5 | "Alat lupa dimatikan / mulai boros, baru ketahuan di akhir bulan." | Warung, kafe, roti, laundry | Hipotesis | Peringatan penyimpangan harian | Notifikasi pertama yang tepat | Plus |
| PP6 | "Token habis pas ramai." | Prabayar ⚠ | Hipotesis | Prediksi token habis | Pengingat sebelum habis | Plus |
| PP7 | "Mau ganti alat, bingung balik modalnya." | Alat besar (pengering, oven, chiller) | Hipotesis | Kalkulator ROI | Hasil rentang balik modal | Plus |
| PP8 | "Susah rapikan biaya buat bank/pembeli." | Usaha yang ajukan pembiayaan | Hipotesis ⚠ | Laporan efisiensi PDF | Laporan siap kirim | Plus / Fase 3 |

### 2.3 Hipotesis baru untuk diuji (belum ada di v0.1)

| # | Hipotesis | Kenapa penting |
|---|---|---|
| H1 | Pemilik lebih peduli **"biaya per unit usaha"** (Rp/kg, Rp/porsi) daripada kWh | Menentukan bahasa utama UI; kWh disembunyikan |
| H2 | Karyawan sering menjadi penyebab pemborosan (alat lupa dimatikan), sehingga **fitur untuk karyawan** (checklist tutup toko dari game) bernilai | Bisa menjadi fitur retensi yang murah |
| H3 | Pemilik mau berbagi data bila **dibandingkan dengan usaha sejenis** ("lebih boros/hemat dari rata-rata") | Mendukung retensi dan sponsor |
| H4 | Momen paling mudah dijual: **tagihan baru naik** atau **tarif/daya diubah** | Menentukan kapan iklan/notifikasi diarahkan |

### 2.4 Panduan wawancara (tambahan untuk Fase 0, target 30 usaha)

1. Berapa tagihan listrik bulan lalu dan bulan sebelumnya? Prabayar atau pascabayar?
2. Alat mana yang menurut Anda paling boros? Berapa rupiahnya menurut Anda?
3. Kapan terakhir tagihan naik mengejutkan? Apa yang Anda lakukan?
4. Siapa yang menyalakan dan mematikan alat? Pernah lupa?
5. Apakah Anda mencatat sesuatu setiap hari? Dengan apa (buku, WhatsApp)?
6. Berapa Anda mau bayar per bulan untuk bukti penghematan Rp100 ribu? (uji harga)
7. Mau bermain game sederhana 2 menit untuk melihat simulasi? Kenapa/kenapa tidak?
8. Apakah ada pihak (bank, koperasi, pembeli) yang pernah meminta catatan biaya Anda?

### 2.5 Alasan berhenti yang harus dirancang

Sudah hemat dan merasa tahu caranya · terlalu repot mengisi · tidak percaya angka estimasi · harga terasa berat. Mitigasi di bagian 6 (retensi) dan PRD 3 (keyakinan dan transparansi rumus).

⚠ Usaha bertagihan kecil (< `[Rp500 ribu]`): hemat 10% bisa lebih kecil dari fee Plus. Segmen ini diposisikan sebagai pengguna game/trial dan sumber data.

## 3. Alur produk end-to-end

```
GRATIS                    TRIAL 30 HARI                               BERBAYAR
[A] Main Kios Virtual → [B] Aktifkan trial → [C] D1–7 Misi Meter → [D] D7 Laporan Pertama
    (tanpa data)            (hubungkan data     (data berlabel)         (estimasi + 1–3 saran)
                             asli)
                  → [E] D8–30 fitur Plus aktif → [F] D30 Laporan Hasil (hemat terukur)
                       (alert, token, Tanya Wati,            │
                        ROI, laporan)            ┌───────────┴───────────┐
                                           Berlangganan Plus     Tidak lanjut: game tetap
                                                                 gratis, AI terkunci
```

**Mengapa 30 hari:** satu siklus tagihan penuh, sehingga hasil hemat dibandingkan dengan baseline di akhir trial.

## 4. Monetisasi

| Tingkat | Isi | Harga (hipotesis) |
|---|---|---|
| **Gratis** | Game Kios Virtual, simulasi, template | Rp0, tanpa batas waktu |
| **Trial 30 hari** | Semua fitur Plus | Rp0, 30 hari |
| **Plus** | Analisis berkelanjutan, peringatan, prediksi token, ROI, Tanya Wati, laporan | `[Rp15.000–25.000/bulan]` |
| **Plus+ (roadmap)** | Sensor/AMI, real-time per alat | `[X]` |
| **Sponsor (roadmap)** | Kohort didanai bank/dinas/ESG | `[X]` |

- Aturan awal: fee Plus ≤ `[20]%` dari hemat bulanan yang diperkirakan.
- **Garansi hemat 2× ditunda** (alasan di v0.1 §10.3); opsi: kredit bersyarat di bulan berbayar pertama. ⚠ Keputusan tim.
- **Setelah trial tanpa langganan (usulan ⚠):** game tetap gratis, analisis AI berhenti, riwayat dan laporan terakhir bisa diekspor, data dihapus sesuai kebijakan retensi.

## 5. Kontrak antar-PRD (sumber kebenaran)

| # | Kontrak | Pemilik | Pengguna | Bentuk |
|---|---|---|---|---|
| C1 | **Template Schema** (katalog alat, daya, satuan usaha, aksi hemat) | PRD 2 | PRD 1, PRD 3 | JSON versi, lihat PRD 2 §4 |
| C2 | **Pustaka `energy-calc`** (rumus kWh, Rp, faktor beban) dipakai **bersama** oleh game dan mesin estimasi | PRD 3 | PRD 2, PRD 1 | Modul kode tunggal; game tidak boleh punya rumus sendiri |
| C3 | **AI Gateway API** (`/ai/ocr-meter`, `/ai/stt-extract`, `/ai/estimate`, `/ai/recommend`, `/ai/explain`, `/ai/ask`) | PRD 3 (skema), PRD 1 (host) | PRD 1, PRD 2 | OpenAPI; mode `mock` atau `live` |
| C4 | **Mission Event** (misi selesai + payload data berlabel) | PRD 2 | PRD 1 (simpan), PRD 3 (konsumsi) | JSON event, lihat PRD 2 §6 |
| C5 | **Entitlement** (`free`, `trial`, `plus`, `locked`) | PRD 1 | PRD 2, PRD 3 | Klaim di token auth + cek server |
| C6 | **Tingkat keyakinan** (Tinggi/Sedang/Rendah) dan aturan tampilnya | PRD 3 | PRD 1, PRD 2 | Enum + ambang di konfigurasi |

**Aturan emas:** angka rupiah/kWh hanya boleh berasal dari C2. LLM tidak pernah menghitung angka.

## 6. Retensi setelah "sudah hemat"

1. **Peringatan penyimpangan** (hemat bisa menguap).
2. **Saran bertingkat** (beban puncak, daya/tarif, ROI ganti alat).
3. **Pembanding sejenis** anonim.
4. **Laporan bulanan** yang berguna sebagai catatan biaya.
5. **Model "lulus"** ke paket pemeliharaan `[Rp5.000–10.000]` + rujukan.
6. **Terbuka:** apakah cukup, pantau retensi bulan ke-3 dan ke-6.
7. **Baru:** *checklist tutup toko* via game untuk karyawan (H2), bila terbukti di wawancara.

## 7. Metrik keberhasilan

| Tahap | Metrik | Target |
|---|---|---|
| Penarikan | Memulai Kios Virtual | `[X]` |
| Keterlibatan | Menyelesaikan Misi Meter hari 7 | `[X]%` |
| Aktivasi | Menghubungkan data asli (mulai trial) | `[X]%` |
| Nilai | Melihat Laporan Pertama; menjalankan ≥1 saran | `[X]%` |
| Konversi | Trial → Plus | `[X]%` |
| Retensi | Aktif bulan ke-2, ke-3 | `[X]%` |
| Dampak | Penurunan kWh per satuan usaha vs baseline | ≈ −10% |
| Kelayakan harga | Hemat terbukti ≥ fee | ≥ 3 dari 5 usaha pilot |
| Kualitas AI | OCR ≥ 90%, STT ≥ 85%, galat estimasi vs sensor | lihat PRD 3 §9 |
| Ekonomi | Biaya AI per pengguna | < harga Plus |

## 8. Rencana rilis (selaras target tim: AI diuji ≤ Jan 2027, pilot ≤ Apr 2027, Demo Day Mei 2027)

| Fase | Periode | PRD 1 | PRD 2 | PRD 3 |
|---|---|---|---|---|
| **0. Validasi** | Nov 2026 – Jan 2027 | Kerangka app + auth, AI **mock** | Prototipe Kios Virtual 1 template | Kumpulkan 50 foto meter + 50 voice note; uji OCR/STT; katalog 3 template |
| **1. MVP** | Jan – Feb 2027 | Trial, laporan, notifikasi, admin dasar | 3 template, misi M1–M4, level | Estimasi + cross-validation v0, rekomendasi v0, **AI live bertahap** |
| **2. Pilot berbayar** | Mar – Apr 2027 | Langganan Plus, pembayaran | Hadiah nyata, uji varian retensi | Sensor kebenaran dasar di 2–3 usaha; fitur Plus (alert, token, ROI, Tanya Wati) |
| **3. Lanjutan** | Setelah Mei 2027 | Multi-kios (setelah Fase 3) | Template tambahan | Sensor/AMI, sponsor |

## 9. Risiko

| # | Risiko | Mitigasi |
|---|---|---|
| R1 | Estimasi per alat meleset tanpa sensor | Label estimasi, keyakinan, kategori besar, validasi sensor pilot (PRD 3) |
| R2 | Klaim real-time/Jarvis melebihi kemampuan | Batasi klaim (bagian 1) |
| R3 | "UMKM semua" memecah validasi | 3 template MVP; pilot berbayar fokus 1–2 bidang |
| R4 | Gamifikasi dianggap gimmick | Hadiah nyata, uji varian, tanpa klaim sebelum data |
| R5 | Garansi disalahgunakan | Tidak dipakai; kredit bersyarat |
| R6 | Margin tipis | Ukur biaya AI; kendali biaya; sponsor |
| R7 | Pengguna tidak disiplin mengisi | ≤ 2 menit/hari, pengingat, misi pendek |
| R8 | Prabayar tanpa catat meter | Input struk token + layar sisa kWh |
| R9 | Privasi foto/suara/data usaha | Persetujuan, hapus data, retensi terbatas (UU PDP) |
| R10 | Pengguna tidak percaya angka | Tampilkan rumus; estimasi vs terukur |
| R11 | Hadiah nyata butuh mitra/anggaran | Mulai dari kredit langganan + stiker QR |
| R12 | Segmen tagihan kecil tidak menutup fee | Hanya game/trial |
| **R13 (baru)** | **Tiga PRD berjalan paralel dan kontraknya melenceng** | Kontrak C1–C6 dibekukan per sprint; contract test di CI |
| **R14 (baru)** | **AI placeholder terlalu "bagus" sehingga demo menyesatkan** | Mock memakai label "contoh" di UI dan keluaran dapat dikonfigurasi gagal/keyakinan rendah |
| **R15 (baru)** | **Game memakai rumus berbeda dari mesin estimasi sehingga angka simulasi ≠ laporan** | Kontrak C2: satu pustaka |

## 10. Pertanyaan terbuka (diperbarui)

1. Persentase prabayar vs pascabayar target? (prioritas prediksi token)
2. Setelah trial tanpa langganan: usulan §4 disetujui?
3. Garansi: tidak ada / kredit bersyarat?
4. Bagi hasil di atas fee: dipakai atau tidak?
5. Mekanisme betah di game dan langganan (PRD 2 §9).
6. **Platform mobile:** PWA + Capacitor (rekomendasi) atau native/React Native/Flutter (PRD 1 §4).
7. Tiga template MVP dan siapa memverifikasi katalog.
8. Sumber anggaran dan mitra hadiah nyata.
9. Referensi "Pak Pras": fitur apa yang ingin ditiru? (belum dikenali; PRD 2 menafsirkan sebagai village builder)
10. Ukuran pasar UMKM berdaya listrik tinggi di Semarang belum bersumber.
11. **Baru:** Siapa penyedia LLM/OCR/STT (cloud vs open source) dan batas biaya per pengguna? (PRD 3 §11)
12. **Baru:** Apakah karyawan (P2) boleh punya akun sendiri, atau berbagi akun pemilik? (PRD 1 §3)

## 11. Perubahan dari v0.1

- Dipecah menjadi indeks + 3 PRD berdasarkan alur kerja tim.
- Penamaan **Pro → Plus**.
- Pain point dilengkapi kolom "aha moment", hipotesis baru H1–H4, dan panduan wawancara.
- Ditambahkan **kontrak antar-PRD C1–C6** dan risiko R13–R15.
- PRD 1 memuat arsitektur, API, model data, strategi AI **mock → live**, dan opsi mobile.
- PRD 2 memuat skema template, mesin misi, aturan level, anti-curang, dan peran AI assistant di game.
- PRD 3 memuat pipeline per langkah, skema JSON, ambang keyakinan, rencana evaluasi, dan contoh hitung.
