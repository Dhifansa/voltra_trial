# Wattera — Konsep Ide v2

**Tim d1306 (UNNES) · Draft 1 · 5 November 2026 · untuk diskusi tim sebelum membangun app baru**

> Semua angka dan harga di dokumen ini adalah **hipotesis** sampai diuji ke pengguna. Tanda `[X]` = belum ditetapkan.

---

## 0. Ringkasan satu paragraf

Wattera adalah **AI penasihat listrik untuk UMKM** yang dimulai dari *permainan simulasi* (tanpa data, tanpa biaya), lalu mengajak pemilik usaha menghubungkan data listrik aslinya (foto meter + catatan suara), dan akhirnya memberi **rekomendasi penghematan dalam Rupiah** yang dijalankan setelah disetujui pemilik dan diverifikasi bulan berikutnya. Gamifikasi bukan produk utamanya, melainkan **pintu masuk**: cara memperkenalkan alat sebelum orang mau berlangganan. Karena pintu masuknya generik, cakupan bisa diperluas dari laundry ke UMKM berdaya listrik tinggi lain lewat "paket jenis usaha". AI/AX diletakkan di **sistem rekomendasi**. Fokus sekarang: **software saja**, tanpa IoT.

**Tiga keputusan tim yang dipegang dokumen ini**
1. Gamifikasi bukan yang ditonjolkan; fungsinya memperkenalkan alat sebelum beli/berlangganan.
2. Dengan konsep itu, scope diperluas ke UMKM pada umumnya (bukan hanya laundry).
3. Cara membuat user betah bermain *dan* berlangganan **belum terjawab** → ditandai terbuka di bagian 5.4 dan 12, dengan beberapa kandidat untuk diuji.

---

## 1. Apa yang berubah dari versi sebelumnya

| Aspek | Versi sebelumnya | Versi 2 |
|---|---|---|
| Target | Laundry kiloan sekitar kampus | Satu *wedge* (laundry) + paket jenis usaha lain |
| Pintu masuk | Langsung foto meter dan suara | Simulasi/permainan dulu, data asli menyusul |
| Sensor IoT | Dipasang di pilot | **Keluar dari scope software**; hanya opsional untuk kalibrasi pilot |
| Retensi | Belum ada | Dirancang dari awal (bagian 9) |
| Monetisasi | Satu skema commitment fee | Tangga harga + pendanaan sponsor (bagian 8) |
| Penentuan alat boros | Belum dijelaskan | Mesin estimasi berbasis fisika + data yang dihasilkan misi (bagian 6) |

---

## 2. Jawaban untuk tiga pertanyaan juri (versi ringkas)

**P1. Bagaimana AI tahu alat mana yang membuat tagihan tinggi? Datanya dari mana?**
Tanpa sensor, AI **tidak bisa** mempelajarinya dari riwayat tagihan saja. Jawaban jujurnya: kami tidak mulai dari model *machine learning* yang dilatih, tetapi dari **estimasi berbasis fisika** (daya alat × jam pakai) yang dicocokkan dengan selisih angka meter. Data yang dibutuhkan *dihasilkan oleh misi pemilik sendiri*: foto meter pagi dan malam + catatan suara jam pakai alat. Hasilnya ditampilkan sebagai **estimasi dengan tingkat keyakinan**, dan divalidasi memakai sensor pada 2–3 usaha pilot sebagai data pembanding. Rinciannya di bagian 6.

**P2. Bagaimana alur bisnis dan uangnya? Kalau mahal, UMKM mau?**
Harga dikunci ke manfaat: fee Pro hanya sebagian kecil dari penghematan terbukti, dengan garansi kredit. Pengguna bertagihan kecil dilayani gratis (jadi corong dan sumber data), pengguna bertagihan besar membayar, dan sponsor (bank, dinas UMKM, program ESG) bisa mendanai kohort. Rinciannya di bagian 8.

**P3. Kalau sudah hemat dan tahu triknya, apa mereka berhenti memakai?**
Sebagian akan, dan itu wajar untuk produk perubahan perilaku. Kami merancang agar nilai produk tidak habis setelah saran pertama: deteksi penyimpangan (hemat yang kembali naik), tingkat saran berikutnya, perbandingan dengan usaha sejenis, dan laporan yang berguna di luar penghematan. Pengguna yang "lulus" pindah ke paket pemeliharaan murah dan menjadi perekrut pengguna baru. Rinciannya di bagian 9.

---

## 3. Alur pengguna: empat tahap

```
[1] MAIN        →  [2] SAMAKAN      →  [3] REKOMENDASI  →  [4] LANGGANAN /
 Simulasi kios      dengan nyata        (AX) + verifikasi     PEMELIHARAAN
 (tanpa data)       foto meter + suara  Rp hemat terbukti
```

1. **Main (Kios Virtual).** Pilih jenis usaha, lihat kios virtual dengan alat-alat umumnya, coba "bagaimana kalau" dan lihat tagihan simulasi turun. Nol hambatan: tanpa foto, tanpa data pribadi.
2. **Samakan dengan nyata.** Ganti alat bawaan dengan alat asli (foto label atau suara), lalu jalankan **Misi Meter 7 hari**: foto meter buka dan tutup + catatan suara singkat.
3. **Rekomendasi.** Hari ke-7 muncul "Laporan Pertama": estimasi alat/jam paling boros dan 1–3 saran dalam Rupiah. Pemilik menyetujui/menolak/menunda; bulan berikutnya sistem memverifikasi.
4. **Langganan atau pemeliharaan.** Setelah laporan pertama, pengguna memutuskan masuk paket berbayar. Titik konversi ini yang kita ukur.

---

## 4. Perluasan scope: dari laundry ke UMKM lain

### 4.1 Prinsip: satu mesin, banyak paket

Mesin inti (OCR meter, catatan suara, estimasi, rekomendasi, verifikasi) sama untuk semua. Yang berbeda hanya **Paket Jenis Usaha**:

- katalog alat umum beserta rentang daya (W),
- satuan usaha untuk normalisasi (kg cucian, loyang roti, porsi katering, balok es, cukuran),
- pola beban umum (jam sibuk, alat yang menyala terus),
- daftar tindakan hemat yang sudah dikenal untuk jenis usaha itu.

### 4.2 Urutan perluasan (usulan)

| Urutan | Paket | Alasan | Satuan usaha (contoh) |
|---|---|---|---|
| 1 (wedge) | Laundry kiloan | Sudah ada wawancara dan alat jelas (cuci, pengering, setrika) | kg cucian |
| 2 | Depot es / air minum | Beban kompresor dan pendingin menyala terus, potensi jam sepi | balok es / galon |
| 3 | Katering / toko roti | Oven, chiller, mixer; beban terjadwal | loyang / porsi |
| 4+ | Warung makan, kafe, konveksi, bengkel, barbershop | Diuji setelah mesin inti terbukti | disesuaikan |

### 4.3 Menjawab risiko "tagihan kecil"

Temuan tim: tagihan barbershop ±Rp300 ribu terlalu kecil untuk langganan. Solusinya bukan membuang segmen itu, tetapi **memisahkan layanan**: tagihan di bawah ambang `[Rp500 ribu]` memakai tingkat Gratis (corong, sumber data, bukti dampak), tagihan di atas ambang ditawari Pro. Ambang ini hipotesis dan perlu diuji.

### 4.4 Risiko memperluas terlalu dini

Setiap paket baru butuh validasi sendiri (alat, satuan, tindakan hemat). Disarankan **pilot berbayar tetap di laundry**, sementara paket lain hanya masuk lewat simulasi/permainan sampai ada permintaan nyata. Jangan klaim "untuk semua UMKM" di pitch; klaim "mulai dari laundry, arsitektur siap diperluas".

---

## 5. Gamifikasi sebagai onboarding

### 5.1 Peran gamifikasi (dan batasnya)

Fungsinya hanya tiga: (1) memperkenalkan konsep "listrik per alat dalam Rupiah" tanpa data asli, (2) menurunkan hambatan mencoba, (3) **menghasilkan data** untuk mesin estimasi lewat misi harian. Ia tidak dijual sebagai fitur utama dan tidak boleh membuat pemilik usaha sibuk bermain. Batas desain: **maksimal 2 menit per hari**.

### 5.2 Konsep: "Kios Virtual" + "Misi Meter"

- **Kios Virtual:** tampilan kios yang berisi alat-alat usaha pemain. Geser jam pakai, lihat tagihan simulasi berubah. Ada tantangan seperti "turunkan tagihan kios 10% tanpa mengurangi jam buka".
- **Misi Meter (7 hari):** tiap hari ada tugas kecil: foto meter pagi, foto meter malam, catatan suara "hari ini nyuci berapa kg dan alat apa saja yang nyala".
- **Maskot** memberi umpan balik dan berubah ekspresi sesuai status (hemat, normal, ada lonjakan).

### 5.3 Menghubungkan dunia virtual dan dunia nyata

| Sisi nyata | Sisi virtual | Mekanisme |
|---|---|---|
| Alat asli (foto label) | Alat di Kios Virtual | Kios dibangun dari inventaris asli, jadi "kembaran digital ringan" |
| Foto meter dan catatan suara harian | Energi/poin untuk "menumbuhkan" kios dan maskot | Tindakan nyata = kemajuan virtual |
| Saran yang benar-benar dijalankan dan terbukti hemat | Lencana dan level naik | Kemajuan virtual hanya dari hasil terverifikasi, bukan klik |
| Penghematan terverifikasi | **Hadiah nyata**: kredit langganan, stiker/QR "Usaha Hemat Energi" untuk dipasang di toko | Gamifikasi punya nilai nyata |
| Sesama pemilik usaha | Liga lokal (per kecamatan/komunitas) | Perbandingan sesama jenis usaha |

Aturan penting: **poin dan lencana yang hanya virtual cepat membosankan.** Hadiah yang bernilai di dunia nyata (potongan biaya, bukti hemat untuk pelanggan/bank) yang membuat orang kembali. Biaya hadiah harus masuk perhitungan unit economics.

### 5.4 Terbuka: membuat user betah (belum terjawab)

Belum ada mekanisme yang terbukti untuk menjaga orang tetap bermain **dan** berlangganan. Kandidat untuk diuji di pilot (jangan dipilih sebelum ada data):

1. **Streak** dengan "hari libur" (agar usaha yang tutup tidak merasa dihukum).
2. **Musim/tantangan bulanan** (mis. "bulan hemat saat tarif/hari raya").
3. **Liga komunitas** dengan perbandingan anonim sesama jenis usaha.
4. **Hadiah nyata** bertingkat (kredit, stiker QR, voucher mitra).

Cara menguji: bandingkan retensi hari ke-7 dan ke-30 serta konversi uji coba→berbayar antar varian di pilot. Tanpa data itu, jangan klaim gamifikasi "membuat betah" di pitch.

---

## 6. Bagaimana AI tahu alat mana yang boros

### 6.1 Masalahnya

Tagihan bulanan hanya satu angka. Model ML yang menebak alat dari riwayat tagihan tidak punya data pelatihan. Memisahkan beban per alat dari satu meter (NILM) secara andal biasanya butuh data berfrekuensi tinggi dari sensor. Jadi di MVP software-only, klaim yang jujur adalah **estimasi**, bukan pengukuran.

### 6.2 Pendekatan: estimasi berbasis fisika + data yang dihasilkan misi

1. **Inventaris alat dengan daya:** dari foto label (OCR) atau katalog paket jenis usaha. Daya label adalah batas atas; beban nyata dikalikan faktor beban.
2. **Waktu pakai:** dari catatan suara dan, bila ada, jadwal tetap (mis. chiller menyala terus).
3. **Estimasi dasar per alat:** `kWh_alat ≈ daya (kW) × jam pakai × faktor beban`.
4. **Rekonsiliasi dengan meter:** jumlah estimasi alat harus mendekati selisih angka meter pada jendela waktu yang sama. Selisih yang tak terjelaskan ditampilkan sebagai "lain-lain/belum terjelaskan", bukan dibagikan paksa ke alat.
5. **Koreksi dari data misi:** dengan foto meter buka dan tutup + jam pakai per hari, tiap hari menjadi satu persamaan. Setelah sekitar `[14–30]` hari, faktor beban efektif tiap alat dapat diperkirakan lewat regresi dengan batasan nilai tidak negatif (non-negative least squares), dengan nilai label sebagai titik awal.
6. **Keyakinan:** tampilkan per alat hanya bila data cukup; bila tidak, tampilkan kategori besar (mis. "pemanas/pengering", "pendingin", "lain-lain").

### 6.3 Sumber data (jawaban "datanya dari mana")

| Sumber | Dipakai untuk | Biaya |
|---|---|---|
| Foto label alat | Daya terpasang | Gratis (OCR) |
| Katalog daya per jenis alat dan usaha | Nilai awal dan validasi kewajaran | Disusun tim, dikurasi dari spesifikasi produk/sumber resmi |
| Foto meter dua kali sehari | Konsumsi per jendela waktu (beban puncak vs sepi) | Dihasilkan misi |
| Catatan suara | Jam pakai dan volume kerja | Dihasilkan misi |
| **Sensor arus di 2–3 usaha pilot** | **Kebenaran dasar (ground truth)** untuk mengukur galat estimasi | Hanya pilot, bukan fitur produk |

Hasil validasi (mis. galat rata-rata per alat) dilaporkan jujur. Bila galat terlalu besar, tampilan per alat diturunkan menjadi kategori.

### 6.4 Efek samping yang bagus

Setiap misi yang selesai = satu titik data berlabel. Seiring pengguna bertambah, katalog dan faktor beban per jenis usaha makin baik. Ini yang membuat gamifikasi **berfungsi sebagai pengumpul data**, bukan hiasan.

---

## 7. AI/AX di sistem rekomendasi

AI ditempatkan di tempat nilai terbesar: dari data mentah ke keputusan, dengan manusia tetap memutuskan.

### 7.1 Komponen

1. **Pemahaman input:** OCR meter/struk token; speech-to-text dan ekstraksi terstruktur dari catatan suara (kg, alat, jam), dengan konfirmasi ke pengguna.
2. **Mesin estimasi:** bagian 6.
3. **Pustaka tindakan hemat** per paket usaha. Tiap tindakan punya: syarat berlaku, rumus estimasi hemat dari data pengguna, usaha/biaya, dan catatan keselamatan.
4. **Peringkat rekomendasi:** skor = `perkiraan hemat (Rp) × keyakinan × kemudahan`. Maksimal `[3]` saran aktif.
5. **LLM:** menyusun penjelasan sederhana ("kenapa saran ini"), mengajukan satu pertanyaan klarifikasi bila data ambigu, dan menulis laporan bulanan. **LLM tidak menghitung angka;** angka berasal dari rumus yang bisa diaudit.
6. **Verifikasi dan pembelajaran:** setelah saran disetujui dan dijalankan, bulan berikutnya sistem membandingkan dengan baseline (kWh per satuan usaha, tarif dipisahkan). Hasil setuju/tolak/terbukti memperbarui prioritas saran.

### 7.2 Pagar pengaman

- Tidak ada tindakan tanpa persetujuan pemilik.
- Tidak menyarankan hal yang membahayakan keselamatan (membebani instalasi, melewati meter, dsb.).
- Tidak mengarang angka; bila data kurang, katakan "belum cukup data".
- Atribusi per alat selalu berlabel "estimasi".

---

## 8. Bisnis dan monetisasi

### 8.1 Tangga paket (hipotesis)

| Paket | Isi | Harga | Peran |
|---|---|---|---|
| **Gratis** | Kios Virtual, simulasi, Misi Meter, Laporan Pertama ringkas | Rp0 | Corong, sumber data, melayani tagihan kecil |
| **Pro** | Saran penuh, verifikasi bulanan, laporan, pengingat, garansi kredit | `[Rp15.000–25.000/bulan]` (hipotesis tim, belum diuji) | Pendapatan inti untuk tagihan ≥ ambang |
| **Pemeliharaan** | Deteksi penyimpangan + laporan ringkas | `[Rp5.000–10.000/bulan]` | Untuk pengguna yang sudah "lulus" |
| **Kohort sponsor** | Kohort UMKM didanai pihak ketiga, laporan dampak agregat | `[X]` per kohort | Pendapatan B2B2C |

### 8.2 Arus pendapatan

1. **Langganan Pro/Pemeliharaan** dari pemilik UMKM.
2. **Sponsor kohort** (bank yang punya program UMKM, dinas koperasi/UMKM, program ESG/CSR perusahaan). Mereka membayar karena mendapat bukti dampak terukur (kWh, Rp, emisi) tanpa membangun sendiri. Konsisten dengan arah lomba (MRV).
3. **Rujukan peralatan hemat** (timer, LED, servis) sebagai komisi. Catatan: hanya bila rekomendasi tetap objektif dan terbuka soal komisi.
4. **Roadmap:** laporan emisi/ESG untuk UMKM pemasok (ide X2) sebagai add-on, belum dibangun sekarang.

### 8.3 Unit economics (isi setelah pilot)

```
Biaya variabel per pengguna = OCR + STT + LLM + pesan WhatsApp/notifikasi + biaya hadiah
Margin per pengguna        = harga - biaya variabel
Titik impas (pengguna)     = biaya tetap bulanan / margin per pengguna
```

Kendali biaya AI: OCR dan STT hanya saat ada input, LLM hanya untuk penjelasan dan laporan (bukan tiap interaksi), hasil di-cache, ringkasan mingguan dibatch. **Biaya AI per pengguna belum terukur;** jangan menetapkan fee final sebelum data pilot.

### 8.4 "Kalau mahal, UMKM tetap mau?"

- Harga dibandingkan dengan **hemat terbukti**, bukan dengan nilai teknologi. Aturan awal: fee Pro ≤ `[20]%` dari hemat bulanan yang diperkirakan; contoh ilustrasi: tagihan Rp500 ribu × 10% = ±Rp50 ribu, fee Rp15–25 ribu masih masuk. Ini ilustrasi, bukan data.
- Tidak ada pembayaran sebelum pengguna melihat Laporan Pertama.
- Garansi kredit hanya di paket Pro dan bersyarat (saran yang disetujui dijalankan, data rutin dikirim). Tim sudah mencatat garansi bisa disalahgunakan dan margin tipis; bagi hasil masih diperdebatkan dan belum diputuskan.
- Tagihan kecil tidak dipaksa membayar.

---

## 9. Retensi setelah pengguna "sudah tahu triknya"

Kenyataannya: sebagian pengguna akan berhenti setelah mendapat penghematan awal. Rancangan untuk memperkecil dan mengelola itu:

1. **Hemat bisa menguap.** Mesin menua, volume dan tarif berubah. Deteksi penyimpangan terhadap baseline per satuan usaha menjaga nilai berjalan.
2. **Tingkat saran berikutnya.** Setelah kemenangan mudah (jadwal, kebiasaan), muncul yang lebih dalam: pengelolaan beban puncak, tinjauan daya terpasang dan tarif, simulasi balik modal penggantian alat.
3. **Perbandingan sesama usaha** (anonim, sejenis dan seukuran) memberi alasan kembali: "usaha mirip denganmu rata-rata `[X]` kWh per kg".
4. **Dokumen yang berguna di luar hemat.** Laporan bulanan sebagai bukti pengelolaan biaya untuk bank/pembeli; fondasi untuk laporan ESG (roadmap).
5. **Model "lulus".** Pengguna yang sudah stabil pindah ke Pemeliharaan murah dan diajak merujuk usaha lain (imbalan kredit). Bagian dari pertumbuhan adalah **pengguna baru dari lulusan.**
6. **Terbuka:** apakah semua di atas cukup menahan pengguna belum diketahui. Metrik pantau: retensi bulan ke-3 dan ke-6, tingkat "lulus", dan rujukan per pengguna.

---

## 10. Arsitektur software (fokus saat ini)

### 10.1 Modul

| Modul | Isi | Prioritas MVP |
|---|---|---|
| Onboarding dan Kios Virtual | Pilih paket usaha, simulasi, tantangan | Must |
| Penangkapan data | OCR meter/token, catatan suara, koreksi manual | Must |
| Inventaris dan katalog alat | Paket jenis usaha, foto label | Must |
| Mesin estimasi | Bagian 6 | Must |
| Mesin rekomendasi (AX) | Bagian 7 | Must |
| Verifikasi dan laporan | Baseline, normalisasi per satuan, pemisahan tarif | Must |
| Langganan dan garansi | Paket, pembayaran, kredit | Should |
| Gamifikasi lanjutan | Streak, liga, hadiah | Could (setelah data uji) |
| Admin dan analitik | Akurasi OCR/STT, biaya AI per pengguna, konversi | Should |
| Privasi | Persetujuan, hapus data (UU PDP) | Must |

### 10.2 Di luar scope sekarang

Sensor/IoT sebagai fitur produk, penjadwalan alat otomatis, modul air/gas, pembayaran PPOB, integrasi Gmail, laporan ESG penuh.

### 10.3 Keputusan teknis yang perlu tim pilih

- Platform: app mobile atau PWA/WhatsApp-first (UMKM akrab dengan WhatsApp dan voice note).
- OCR dan STT: layanan cloud atau model terbuka; uji akurasi dengan foto/suara asli dulu.
- Penyimpanan foto/suara: lama simpan dan hak hapus.

---

## 11. Metrik dan rencana validasi

| Pertanyaan | Metrik | Target (hipotesis) |
|---|---|---|
| Orang mau mencoba permainan? | Mulai Kios Virtual / terpapar | `[X]%` |
| Mau lanjut ke data nyata? | Penyelesaian Misi Meter hari ke-7 | `[X]%` |
| Mau membayar? | Konversi uji coba → Pro | `[X]%` |
| Estimasi cukup akurat? | Galat vs sensor pilot; akurasi OCR ≥90% (50 foto), pemahaman suara ≥85% (50 pesan) | sesuai target tim |
| Hemat nyata? | kWh per satuan usaha vs baseline | ≈ -10% |
| Hemat > fee? | Penghematan terbukti ≥ fee | ≥ 3 dari 5 usaha pilot |
| Betah? | Retensi D7, D30, bulan ke-3 | `[X]` |
| Biaya terkendali? | Biaya AI per pengguna | di bawah harga Pro |

Urutan validasi: wawancara (target 30) → uji OCR/STT dengan data asli → pilot 8 minggu 5 usaha berbayar dengan sensor di sebagian → uji varian gamifikasi.

---

## 12. Risiko dan pertanyaan terbuka

1. **Estimasi per alat tanpa sensor** bisa meleset; mitigasi: label estimasi, keyakinan, kategori besar, validasi ke sensor pilot.
2. **Gamifikasi bisa jadi gimmick** bila tidak terhubung hadiah nyata; efek ke retensi belum terbukti (5.4).
3. **Scope terlalu lebar** memecah validasi; mitigasi: pilot laundry dulu (4.4).
4. **Margin tipis** bila fee hanya menutup biaya AI; model bagi hasil vs fee + margin belum diputuskan.
5. **Penyalahgunaan garansi** dan pemilik yang tidak disiplin memotret.
6. **Pengguna prabayar** tidak punya catat meter bulanan; input harus menerima riwayat pembelian token.
7. **Privasi:** foto meter, suara, dan data usaha adalah data pribadi; butuh persetujuan eksplisit dan hak hapus.
8. **Ukuran pasar** (jumlah laundry dan UMKM berdaya tinggi di Semarang) belum bersumber.
9. **Hadiah nyata** (stiker QR, voucher) butuh mitra dan anggaran; belum ada.

---

## 13. Cek sebelum presentasi berikutnya

Dari dokumen tim yang ada:
- **Anggota tim tidak konsisten:** isian final menyebut 3 orang (Annisa, Mahdi, Dhifansa), sedangkan slide 6 pitch deck menyebut 4 nama (menambah Muchsin). Samakan.
- **Angka "59% energi dipakai pengering" (audit laundry Malaysia)** dan **listrik ±19% dari biaya operasional** sebaiknya ditautkan ke sumber primer di slide.
- **Klaim pesaing:** cek fitur PLN Mobile terbaru (catat meter mandiri SwaCAM yang saya temukan bersifat pencatatan meter bulanan pascabayar) dan nama produk Leastric sebelum ditampilkan.
- **Isian final menulis "AI + IoT"**; dokumen ini software-first. Bila arah berubah, perbarui narasi agar juri tidak bingung.
- **Slide 6 sudah menyebut future work** (Gmail, air, PPOB, sensor); tambahkan gamifikasi onboarding dan paket multi-UMKM sebagai arah, dengan catatan "belum divalidasi".

---

## 14. Langkah eksekusi (urutan membangun app)

1. **Sepakati paket pertama:** laundry penuh; satu paket kedua (depot es atau katering) hanya sebagai simulasi.
2. **Susun katalog alat** untuk dua paket itu (daya, satuan usaha, tindakan hemat).
3. **Bangun alur inti dulu:** foto meter → OCR → koreksi → baseline; lalu catatan suara → data terstruktur.
4. **Mesin estimasi v0** (rumus + rekonsiliasi), dengan label estimasi dan keyakinan.
5. **Rekomendasi v0:** pustaka tindakan + peringkat + penjelasan LLM + persetujuan.
6. **Kios Virtual dan Misi Meter** sebagai bungkus onboarding.
7. **Laporan bulanan dan verifikasi** (baseline, normalisasi, pemisahan tarif).
8. **Pembayaran dan garansi** setelah tiga hal sebelumnya berfungsi.
9. **Admin/analitik** untuk akurasi, konversi, dan biaya AI sejak awal pilot.
