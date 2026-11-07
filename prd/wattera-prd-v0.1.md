# PRD — Wattera (AI Energy Copilot untuk UMKM)

**Versi:** 0.1 (draft) · **Tanggal:** 5 November 2026 · **Pemilik:** Tim d1306 (UNNES)
**Status:** untuk review tim dan mentor sebelum membangun app baru
**Dokumen terkait:** `wattera-konsep-v2.md`

> Semua angka, harga, dan target adalah **hipotesis** sampai diuji ke pengguna. Tanda `[X]` = belum ditetapkan. Tanda ⚠ = hal yang perlu keputusan atau pengecekan tim.

---

## 1. Ringkasan produk

Wattera membantu pemilik UMKM mengetahui **ke mana uang listriknya pergi** dan **apa yang harus diubah**, dalam Rupiah. Pengguna masuk lewat **game simulasi gratis** (Kios Virtual), lalu mengaktifkan **trial 30 hari** untuk menghubungkan data listrik asli (foto meter, catatan suara). AI memberi analisis dan rekomendasi; di hari ke-30 pengguna melihat **hasil hemat terukur** dan memutuskan berlangganan (Pro) untuk pemantauan jangka panjang dan fitur lanjutan.

**Fokus rilis ini: software saja.** Tanpa sensor/IoT sebagai bagian produk.

### 1.1 Keputusan tim yang menjadi dasar PRD

| # | Keputusan | Sumber |
|---|---|---|
| K1 | Target **UMKM secara umum**, bukan hanya laundry | Diskusi tim |
| K2 | Game = simulasi/onboarding **gratis**; AI penuh = **trial 30 hari**, lalu berbayar untuk pemakaian jangka panjang (fitur Plus) | Diskusi tim |
| K3 | Game mencakup **1 kios** per pengguna, dengan **template per sub-bidang** (laundry, rumah makan, dst.) | Diskusi tim |
| K4 | Data estimasi fisika + input pengguna dipakai sebagai **cross-validation** untuk analisis AI, dan dikemas sebagai **misi** di game | Diskusi tim |
| K5 | AI/AX ditempatkan di **sistem rekomendasi** | Diskusi sebelumnya |
| K6 | Personalisasi game bergaya *village builder*; "village" = ruko/kios UMKM pengguna | Diskusi tim |

⚠ Referensi "punya Pak Pras" tidak saya kenal. Bagian 7 menafsirkannya sebagai game pembangun desa/kota yang bisa dipersonalisasi. Bila ada fitur spesifik dari referensi itu yang ingin ditiru, tambahkan di bagian 7.

---

## 2. Masalah dan alasan pengguna mau memakai Wattera

### 2.1 Bukti yang ada sekarang

Hanya **2 wawancara** (pemilik laundry dan barbershop di sekitar UNNES). Temuan yang bisa dipegang: pemilik sudah menduga alat terbesar, **tetapi belum tahu berapa rupiahnya, kapan boros, dan apa yang harus diubah.** Pain point lain di bawah adalah hipotesis.

### 2.2 Pain point dan jawaban produk

| # | Pain point | Status bukti | Jawaban produk | Fase |
|---|---|---|---|---|
| PP1 | Tagihan hanya satu angka total; tidak tahu alat/jam mana yang boros dan berapa Rp-nya | Didukung wawancara (2 usaha) | Estimasi per alat/jam dalam Rp + saran spesifik | MVP |
| PP2 | Takut "aplikasi hemat" tidak ada hasilnya; tidak mau bayar sebelum yakin | Hipotesis (wajar untuk UMKM sensitif harga) | Game gratis + trial 30 hari + hasil hemat terukur sebelum bayar | MVP |
| PP3 | Tidak punya waktu mencatat atau mengisi form panjang | Hipotesis; sesuai kebiasaan WhatsApp dan voice note | Input ≤ 2 menit/hari: foto + suara | MVP |
| PP4 | Lonjakan listrik tidak terdeteksi (alat lupa dimatikan, alat rusak) | Hipotesis | Peringatan penyimpangan berbasis pembacaan harian | Pro |
| PP5 | Token prabayar habis saat jam sibuk | Hipotesis; ⚠ klaim "sebagian besar UMKM prabayar" belum terbukti | Prediksi token habis + pengingat | Pro |
| PP6 | Keputusan ganti/peremajaan alat tanpa hitungan balik modal | Hipotesis | Kalkulator ROI ganti alat | Pro |
| PP7 | Sulit merapikan catatan biaya operasional untuk bank/mitra | Hipotesis; ⚠ belum dicek ke bank | Laporan efisiensi bulanan (PDF) sebagai dokumen pendukung | Pro / Fase 3 |

### 2.3 Kenapa pengguna mau mencoba, lalu bertahan

**Mencoba:** (1) game tanpa data dan tanpa biaya, (2) langsung melihat Rupiah, (3) tidak ada risiko karena trial gratis.
**Bertahan:** (1) bukti hemat 30 hari dari datanya sendiri, (2) nilai yang berlanjut (deteksi penyimpangan, saran tingkat lanjut, pembanding sejenis), (3) usaha kecil di input harian.
**Alasan berhenti yang perlu dirancang:** sudah hemat dan merasa tahu caranya, terlalu repot mengisi, tidak percaya angka estimasi, harga terasa berat. Mitigasi ada di bagian 9, 10, dan 13.

⚠ Untuk UMKM bertagihan kecil, penghematan 10% mungkin lebih kecil dari fee. Segmen ini sebaiknya diposisikan sebagai pengguna game/trial saja (bagian 10.4).

---

## 3. Pengguna

| Persona | Peran | Kebutuhan utama |
|---|---|---|
| **P1 Pemilik UMKM** (pengguna utama dan pembayar) | Laundry, rumah makan, toko roti/katering, depot, kafe, dll. Satu kios/ruko | Tahu pemborosan dalam Rp, saran jelas, tidak ribet |
| **P2 Karyawan/operator** | Menjalankan alat, mengirim foto/suara harian | Input cepat, tanpa istilah teknis |
| **P3 Admin tim** (internal) | Memantau akurasi AI, biaya AI, konversi | Dashboard dan ekspor |
| **P4 Sponsor** (fase 3) | Bank, dinas UMKM, program ESG | Laporan dampak agregat |

**Kriteria usaha target (hipotesis):** memakai listrik cukup besar untuk ada yang dihemat (tagihan ≥ `[Rp500 ribu]` per bulan), punya minimal satu alat berdaya besar, dan memakai ponsel/WhatsApp.

---

## 4. Scope

### 4.1 Dalam scope (software)

- Game Kios Virtual (1 kios, template per sub-bidang).
- Misi yang menghasilkan data (foto label, foto meter, catatan suara, eksperimen kecil).
- OCR meter/struk token, speech-to-text, koreksi manual.
- Mesin estimasi + cross-validation.
- Sistem rekomendasi (AX) dengan persetujuan pengguna dan verifikasi.
- Trial 30 hari, langganan Pro, laporan.
- Asisten suara berbasis data yang sudah masuk ("Tanya Wati").
- Admin dan analitik dasar, privasi dan hapus data.

### 4.2 Di luar scope (sekarang)

Sensor/IoT dan pemantauan benar-benar real-time per alat, penjadwalan alat otomatis, modul air/gas, pembayaran PPOB, integrasi Gmail, multi-kios, laporan ESG penuh, marketplace alat.

### 4.3 Catatan penting soal "real-time" dan "lacak alat paling boros"

Tanpa sensor atau meter pintar (AMI), Wattera **tidak bisa** memantau per alat secara real-time. Yang bisa dilakukan software saja: analisis **hampir real-time berdasarkan input** (setiap foto/suara baru memicu pembaruan analisis) dan estimasi alat paling boros berlabel "estimasi". Klaim "real-time" dan "Jarvis melacak alat" di pitch harus dibatasi pada hal itu, atau ditandai sebagai **roadmap** yang bergantung pada sensor/AMI. ⚠

---

## 5. Alur produk end-to-end

```
FASE GRATIS                    TRIAL 30 HARI                         BERBAYAR
[A] Main Kios Virtual ──► [B] Aktifkan trial ──► [C] D1–7 Misi Meter ──► [D] D7 Laporan Pertama
     (tanpa data)             (hubungkan data     (data berlabel)          (estimasi + 1–3 saran)
                               asli)
                                         ──► [E] D8–30 fitur Pro aktif ──► [F] D30 Laporan Hasil
                                              (alert, token, Tanya Wati,       (hemat terukur)
                                               kalkulator ROI)                      │
                                                                        ┌───────────┴───────────┐
                                                                  Berlangganan Pro        Tidak lanjut:
                                                                                          game tetap gratis,
                                                                                          AI terkunci
```

**Mengapa 30 hari:** satu siklus tagihan penuh, sehingga hasil hemat bisa dibandingkan dengan baseline pada akhir trial dan titik keputusan bayar didukung bukti, bukan janji.

---

## 6. Monetisasi (ringkas, rincian di bagian 10)

| Tingkat | Isi | Harga (hipotesis) |
|---|---|---|
| **Gratis** | Game Kios Virtual, simulasi, template | Rp0, tanpa batas waktu |
| **Trial 30 hari** | Semua fitur Pro | Rp0, 30 hari |
| **Pro** | Analisis berkelanjutan, peringatan, prediksi token, ROI, Tanya Wati, laporan | `[Rp15.000–25.000/bulan]` |
| **Roadmap** | Pro+ (sensor/AMI, real-time), kohort sponsor, laporan bank/ESG | `[X]` |

---

## 7. Spesifikasi Game: Kios Virtual

### 7.1 Tujuan dan batas

- **Tujuan:** memperkenalkan konsep "listrik per alat dalam Rupiah" tanpa data asli, menurunkan hambatan mencoba, dan **menghasilkan data berlabel** lewat misi.
- **Batas:** gamifikasi bukan yang ditonjolkan; maksimal **2 menit per hari**; kemajuan virtual harus terhubung ke tindakan nyata atau hasil terverifikasi.

### 7.2 Konsep

- Satu pengguna punya **satu kios/ruko** (K3) yang tampil sebagai "village" mini bergaya pembangun desa: kios dapat dihias dan ditingkatkan levelnya.
- Pengguna memilih **template sub-bidang**. Kios terisi alat-alat khas bidang itu; pengguna mengganti dengan alat aslinya.
- Tagihan simulasi dan pemborosan terlihat langsung pada alat di kios (mis. alat "menyala" menghasilkan angka Rp per jam).

### 7.3 Template per sub-bidang

| Template | Alat umum (contoh) | Satuan usaha | Status MVP |
|---|---|---|---|
| Laundry | Mesin cuci, pengering, setrika, pompa air | kg cucian | MVP |
| Rumah makan / warung | Kulkas/freezer, rice cooker, kompor listrik, blender, kipas/AC | porsi | MVP |
| Toko roti / katering | Oven, mixer, chiller/freezer, display cooler | loyang / porsi | MVP |
| Depot air/es | Kompresor, pompa, UV/ozon, freezer | galon / balok | Fase 2 |
| Kafe / minuman | Mesin kopi, grinder, freezer, AC | gelas | Fase 2 |
| Kustom | Kios kosong; tambah alat manual | `[X]` | MVP |

Setiap template berisi: katalog alat beserta rentang daya (W), pola pakai umum, satuan usaha, dan daftar tindakan hemat. ⚠ Isi katalog harus disusun tim dari spesifikasi produk/sumber resmi dan diverifikasi ke pelaku usaha. Pertimbangkan 3 template MVP saja agar validasi tidak melebar.

### 7.4 Misi (inti hubungan virtual ↔ nyata)

| Misi | Aksi nyata pengguna | Data yang dihasilkan untuk AI | Hadiah game |
|---|---|---|---|
| M1 Foto label alat | Memotret label daya alat | Daya terpasang (W) per alat | Alat "terverifikasi" di kios |
| M2 Misi Meter | Foto meter buka dan tutup | Konsumsi per jendela waktu | Energi/poin, kios naik level |
| M3 Catatan jam pakai | Voice note singkat (alat, jam, volume kerja) | Durasi pakai per alat + satuan usaha | Poin, dekorasi |
| M4 Konfirmasi tebakan | Menjawab "AI menebak pengering ±`[X]%`, benar?" | Label koreksi untuk estimasi | Lencana "Detektif" |
| M5 Eksperimen kecil | Misalnya matikan satu alat non-kritis saat istirahat, lalu foto meter | Data kontras (dengan/tanpa alat) | Lencana + poin |
| M6 Jalankan saran | Menjalankan saran yang disetujui | Data intervensi untuk verifikasi | Level naik bila hemat terbukti |

**Aturan keselamatan M5:** hanya alat non-kritis, tidak menyentuh instalasi/kabel, tidak mengganggu layanan; teks panduan jelas. ⚠ Perlu ditinjau mentor.

### 7.5 Progres dan hadiah

- Level kios naik dari tindakan nyata dan hasil terverifikasi, bukan sekadar klik.
- **Hadiah bernilai nyata** (kredit langganan, stiker/QR "Usaha Hemat Energi" untuk dipasang di kios) agar tidak sekadar virtual. ⚠ Butuh anggaran dan keputusan; biaya hadiah masuk unit economics.
- Pengingat misi lewat WhatsApp/notifikasi, dengan opsi mematikan.

### 7.6 Terbuka (belum terjawab)

Bagaimana membuat pengguna **betah bermain dan lanjut berlangganan** belum diketahui (sesuai catatan tim). Kandidat yang diuji di pilot, tanpa klaim sebelum ada data: streak dengan hari libur, tantangan bulanan, liga komunitas sejenis usaha, hadiah nyata bertingkat. Ukuran: retensi D7/D30 dan konversi trial → Pro.

---

## 8. Mesin estimasi dan cross-validation

### 8.1 Prinsip

Tagihan bulanan saja tidak cukup untuk mengetahui alat penyebabnya, dan tidak ada data latih sejak awal. Karena itu mesin tidak mengandalkan model ML yang dilatih, melainkan **estimasi berbasis fisika yang divalidasi silang dengan input pengguna.** Angka dihitung dengan rumus yang bisa diaudit; **LLM tidak menghitung angka.**

### 8.2 Tiga sumber sinyal

| Sinyal | Isi | Dari |
|---|---|---|
| **S1 Prior fisika** | `kWh ≈ daya (kW) × jam pakai × faktor beban` | Katalog template + foto label |
| **S2 Meter** | Selisih angka meter pada jendela waktu | Misi M2 |
| **S3 Pernyataan pengguna** | Jam pakai, volume kerja, konfirmasi tebakan | Misi M3, M4 |

### 8.3 Cara cross-validation

1. Hitung estimasi per alat dari S1 + S3.
2. Jumlahkan dan bandingkan dengan S2 untuk jendela waktu yang sama.
3. **Selisih kecil:** keyakinan naik. **Selisih besar:** sistem tidak diam-diam membagi paksa, tetapi menandai "belum terjelaskan" dan **memicu misi/pertanyaan** (M1, M4, M5) untuk memperbaiki data.
4. Setelah `[14–30]` hari data, faktor beban efektif per alat diperkirakan dengan regresi berbatas nilai tidak negatif (nilai label sebagai titik awal); misi M5 (eksperimen) memperkuat identifikasi.
5. Setiap hasil punya **tingkat keyakinan** (Tinggi/Sedang/Rendah). Bila rendah, tampilkan kategori besar ("pemanas/pengering", "pendingin", "lain-lain"), bukan angka per alat.

### 8.4 Validasi mesin

Di 2–3 usaha pilot, sensor arus dipasang **hanya sebagai kebenaran dasar** untuk mengukur galat estimasi (bukan fitur produk). Laporkan galat apa adanya; bila terlalu besar, turunkan klaim ke tingkat kategori.

### 8.5 Contoh ilustrasi (bukan data)

Pengering 3 kW × 5 jam × faktor beban 0,7 ≈ 10,5 kWh per hari. Jika meter hari itu naik 28 kWh, sistem menandai sisa ±17,5 kWh dan bertanya alat lain apa yang menyala.

---

## 9. AI/AX: sistem rekomendasi dan asisten

### 9.1 Komponen

| Komponen | Fungsi |
|---|---|
| Pemahaman input | OCR meter/struk/label; STT lalu ekstraksi terstruktur (alat, jam, kg/porsi), dengan konfirmasi pengguna |
| Pustaka tindakan | Per template: syarat berlaku, rumus hemat dari data pengguna, usaha/biaya, catatan keselamatan |
| Peringkat | Skor = `hemat (Rp) × keyakinan × kemudahan`; maksimal `[3]` saran aktif |
| LLM (penjelas) | Menyusun penjelasan "kenapa saran ini", pertanyaan klarifikasi, laporan; **bukan** penghitung angka |
| Verifikasi | Bulan/siklus berikutnya: bandingkan dengan baseline (kWh per satuan usaha, tarif dipisahkan); hasil memperbarui prioritas saran |

### 9.2 "Tanya Wati" (asisten suara, versi "Jarvis" yang realistis)

- Pengguna bertanya lewat suara/teks: "Alat mana yang paling boros minggu ini?", "Token habis kapan?", "Kalau ganti pengering worth it?"
- Menjawab dari data pengguna sendiri, dengan label estimasi dan tingkat keyakinan; bila data kurang, berkata jujur dan menawarkan misi untuk melengkapinya.
- **Bukan** pelacak real-time per alat (lihat 4.3). Versi real-time menjadi roadmap Pro+ dengan sensor/AMI.

### 9.3 Pagar pengaman

- Tidak ada tindakan tanpa persetujuan pemilik.
- Tidak menyarankan hal berbahaya (membebani instalasi, mengakali meter, dsb.).
- Tidak mengarang angka; "belum cukup data" adalah jawaban sah.
- Atribusi per alat selalu berlabel estimasi.

---

## 10. Model bisnis, trial, dan fitur Pro

### 10.1 Trial 30 hari

| Hari | Peristiwa |
|---|---|
| 0 | Pengguna menghubungkan data asli (mulai trial), semua fitur Pro terbuka |
| 1–7 | Misi Meter; baseline sementara |
| 7 | **Laporan Pertama**: estimasi alat boros + 1–3 saran |
| 8–30 | Fitur Pro berjalan; pengguna menjalankan saran |
| 25 | Pengingat trial akan berakhir |
| 30 | **Laporan Hasil 30 hari**: hemat terukur vs baseline; ajakan berlangganan |

**Setelah trial bila tidak berlangganan (usulan, ⚠ perlu keputusan):** Kios Virtual tetap gratis; analisis AI berhenti; riwayat dan laporan terakhir dapat dilihat/diekspor; data dihapus sesuai kebijakan retensi.

### 10.2 Fitur Pro (yang membuat pengguna lanjut)

Disaring dari ide fitur berbayar yang ditempel tim, dengan penyesuaian kelayakan software-only:

| Fitur | Cara kerja di MVP (software) | Kelayakan | Catatan |
|---|---|---|---|
| Peringatan penyimpangan | Bandingkan pembacaan harian dengan pola normal per satuan usaha | Ada, **bergantung frekuensi input** | "24 jam real-time" butuh sensor/AMI; di MVP = harian |
| Prediksi token habis | Rata-rata pemakaian harian + sisa kWh dari foto layar meter prabayar | Ada untuk prabayar | ⚠ Seberapa banyak target prabayar perlu dicek di wawancara |
| Kalkulator ROI ganti alat | Hitung hemat dari estimasi konsumsi + tarif; waktu balik modal | Ada | Bergantung kualitas estimasi; tampilkan rentang |
| Tanya Wati | Bagian 9.2 | Ada (berbasis data) | Tanpa klaim real-time |
| Verifikasi bulanan dan saran lanjutan | Bagian 9.1 | Ada | Inti nilai langganan |
| Laporan efisiensi (PDF) | Ringkasan 3–6 bulan: kWh, Rp, tren | Ada | ⚠ Jangan klaim "diterima bank/KUR" sebelum dicek ke pihak bank |

**Untuk pitch:** yang paling kuat sebagai andalan adalah **hemat terukur 30 hari** (bukti, bukan janji), didukung peringatan penyimpangan. Prediksi token menjadi andalan hanya bila wawancara menunjukkan banyak target prabayar.

### 10.3 Harga dan garansi

- Hipotesis harga Pro: `[Rp15.000–25.000/bulan]`; opsi tahunan dengan diskon `[X]`. Tidak ada biaya sebelum trial berakhir.
- Aturan awal: fee Pro ≤ `[20]%` dari hemat bulanan yang diperkirakan (ilustrasi: tagihan Rp500 ribu × 10% ≈ Rp50 ribu; fee Rp20 ribu masih masuk).
- ⚠ **Masukan "garansi hemat 2× lipat dari fee atau uang kembali" saya sarankan tidak dipakai dulu.** Alasannya: hemat tanpa sensor sulit dibuktikan, garansi ketat membuka risiko sengketa dan penyalahgunaan, dan Anda sudah memiliki "garansi alami" berupa trial 30 hari gratis. Opsi yang lebih aman: garansi kredit bersyarat (hemat terbukti < fee → selisih jadi kredit) hanya untuk bulan berbayar pertama. Keputusan tim.

### 10.4 Segmen tagihan kecil

Usaha dengan tagihan di bawah ambang tetap bisa bermain game dan menjalani trial, tetapi paket Pro tidak digencarkan ke mereka. Mereka menjadi sumber data dan bukti dampak.

### 10.5 Pendapatan lanjutan (roadmap)

Kohort sponsor (bank, dinas UMKM, program ESG/CSR) yang mendanai penggunaan dan menerima laporan dampak agregat; komisi rujukan alat hemat (dengan transparansi); laporan emisi/ESG untuk UMKM pemasok sebagai add-on. Semua belum divalidasi.

### 10.6 Unit economics (isi setelah pilot)

```
Biaya variabel/pengguna = OCR + STT + LLM + WhatsApp/notifikasi + biaya hadiah
Margin/pengguna         = harga Pro − biaya variabel
Titik impas             = biaya tetap bulanan ÷ margin/pengguna
```

Kendali biaya: LLM hanya untuk penjelasan/laporan dan dibatch; OCR/STT hanya saat ada input; hasil di-cache. Biaya AI per pengguna **belum terukur**, jadi harga final menunggu data pilot.

---

## 11. Kebutuhan fungsional

Prioritas MoSCoW: **M** wajib MVP · **S** penting · **C** opsional · **W** di luar MVP.

### Epic A — Onboarding dan Game

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-A1 | Daftar/masuk dengan nomor WhatsApp + OTP | M | Bisa daftar dan masuk ulang tanpa isi ulang data; persetujuan kebijakan data ditampilkan |
| FR-A2 | Pilih template sub-bidang | M | Minimal 3 template + Kustom; kios terisi alat bawaan |
| FR-A3 | Kios Virtual: alat, jam pakai, tagihan simulasi dalam Rp | M | Menggeser jam pakai mengubah tagihan simulasi seketika; berjalan tanpa data pribadi |
| FR-A4 | Ganti alat bawaan dengan alat asli (foto label/suara/manual) | M | Nama dan daya terisi dari foto/suara dan bisa dikoreksi; boleh dilewati |
| FR-A5 | Progres/level kios dari misi nyata | S | Level naik hanya dari misi terverifikasi |
| FR-A6 | Hadiah nyata (kredit, stiker QR) | C | Hadiah tercatat dan dapat ditebus; ⚠ butuh mitra/anggaran |
| FR-A7 | Pengingat misi | M | Waktu diatur pengguna; bisa dimatikan |

### Epic B — Penangkapan data

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-B1 | Foto meter pascabayar → OCR kWh | M | Hasil ≤ `[10]` dtk; keyakinan rendah memicu foto ulang; akurasi ≥90% pada 50 foto uji |
| FR-B2 | Foto struk/tangkapan layar token + layar sisa kWh prabayar | M | Membaca tanggal, nominal, kWh; input manual sebagai cadangan |
| FR-B3 | Catatan suara harian → data terstruktur | M | Memahami alat, jam, volume; ≥85% pada 50 pesan; selalu ada konfirmasi/ringkasan yang bisa diedit |
| FR-B4 | Koreksi hasil baca | M | Kolom bisa diedit; koreksi disimpan untuk menghitung akurasi |
| FR-B5 | Baseline dari riwayat 3–6 bulan | M | Unggah banyak foto; bila <3 bulan, baseline ditandai "sementara" |
| FR-B6 | Antrian unggah saat sinyal lemah | S | Foto tersimpan lokal dan terkirim saat tersambung |

### Epic C — Estimasi dan analisis

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-C1 | Estimasi per alat (S1+S3) | M | Rumus tampil di laporan; hasil berlabel estimasi |
| FR-C2 | Cross-validation dengan meter (S2) dan "belum terjelaskan" | M | Selisih ditampilkan, tidak dibagi paksa; memicu misi/pertanyaan |
| FR-C3 | Tingkat keyakinan | M | Tinggi/Sedang/Rendah; keyakinan rendah turun ke tampilan kategori |
| FR-C4 | Normalisasi per satuan usaha | M | kWh per satuan dihitung per periode; rumus ditampilkan |
| FR-C5 | Profil pemakaian per bagian hari | S | Ditandai estimasi bila data jarang |
| FR-C6 | Pemisahan efek tarif | S | Tarif yang dipakai tampil; efek tarif dipisah |

### Epic D — Rekomendasi (AX)

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-D1 | Saran dalam Rp dan kWh dengan keyakinan | M | Maks `[3]` aktif; tiap saran punya tindakan, estimasi hemat, keyakinan |
| FR-D2 | Setujui/tolak/tunda | M | Tidak ada tindakan tanpa persetujuan; keputusan tercatat bertanggal |
| FR-D3 | Penjelasan "kenapa saran ini" | S | 1–2 kalimat, merujuk data pengguna, tanpa istilah teknis |
| FR-D4 | Verifikasi hasil siklus berikutnya | S | Dampak per saran bila data cukup; selain itu "belum cukup data" |
| FR-D5 | Pagar keselamatan | M | Tidak ada saran berbahaya; ditinjau dalam uji konten |

### Epic E — Trial, langganan, laporan

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-E1 | Mesin trial 30 hari | M | Mulai saat data asli terhubung; sisa hari tampil; pengingat hari ke-25 |
| FR-E2 | Laporan Pertama (hari 7) dan Laporan Hasil (hari 30) | M | Memuat metode hitung, baseline, hemat Rp/kWh, bisa dibagikan sebagai gambar/PDF |
| FR-E3 | Langganan Pro dan pembayaran | M | Minimal `[2]` metode (mis. QRIS/transfer); bukti pembayaran; berhenti kapan saja tanpa penalti |
| FR-E4 | Status setelah trial tanpa langganan | M | Game tetap jalan, AI terkunci, riwayat bisa diekspor |
| FR-E5 | Peringatan penyimpangan | S | Notifikasi bila pemakaian melebihi pola normal sebesar `[X]%`; pengguna bisa menandai "tidak relevan" |
| FR-E6 | Prediksi token habis | S | Perkiraan hari/jam dengan rentang; hanya untuk prabayar |
| FR-E7 | Kalkulator ROI ganti alat | S | Output rentang dan asumsi tampak |
| FR-E8 | Tanya Wati | S | Menjawab dari data pengguna; jujur bila data kurang; tanpa klaim real-time |
| FR-E9 | Laporan efisiensi PDF | C | Ringkasan 3–6 bulan |
| FR-E10 | Garansi kredit | C | ⚠ Menunggu keputusan 10.3 |

### Epic F — Admin dan privasi

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-F1 | Dashboard admin | S | Akurasi OCR/STT dari koreksi; konversi funnel; saran disetujui/dijalankan |
| FR-F2 | Pemantauan biaya AI per pengguna | S | Dapat diekspor per pengguna per bulan |
| FR-F3 | Privasi dan kontrol data | M | Pengguna melihat data yang disimpan, menghapus akun dan semua data; foto/suara tidak dipakai untuk hal lain tanpa persetujuan |

### Epic G — Di luar MVP

| ID | Kebutuhan | Fase |
|---|---|---|
| FR-G1 | Integrasi sensor/AMI untuk analisis real-time per alat | Fase 3 |
| FR-G2 | Kohort sponsor dan dashboard dampak | Fase 3 |
| FR-G3 | Template tambahan (depot, kafe, dll.) | Fase 2 |
| FR-G4 | Multi-kios | Setelah Fase 3 |

---

## 12. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
|---|---|
| Kemudahan | ≤ 3 ketukan untuk kirim foto/suara; bahasa sehari-hari; huruf besar; ≤ 2 menit/hari |
| Bahasa | Bahasa Indonesia; STT menangani logat dan bising ruang usaha; ada input teks cadangan |
| Performa | OCR ≤ `[10]` dtk; saran ≤ `[30]` dtk |
| Jaringan | Berjalan di seluler biasa; foto dikompresi; antrian unggah |
| Akurasi | OCR ≥90% (50 foto); STT ≥85% (50 pesan); galat estimasi dilaporkan vs sensor pilot |
| Keselamatan | Tidak ada saran berbahaya |
| Privasi | Persetujuan eksplisit, hapus data atas permintaan, mengikuti prinsip UU PDP; foto meter, suara, dan data usaha diperlakukan sebagai data pribadi |
| Biaya | Biaya AI per pengguna terpantau dan di bawah harga Pro |
| Platform | ⚠ Tim memilih: app mobile atau PWA/WhatsApp-first |

---

## 13. Retensi dan antisipasi "sudah hemat, lalu berhenti"

1. **Nilai berkelanjutan:** peringatan penyimpangan, karena hemat bisa menguap (mesin menua, volume dan tarif berubah).
2. **Saran bertingkat:** setelah kemenangan mudah, muncul saran lanjutan (beban puncak, daya terpasang/tarif, ROI ganti alat).
3. **Pembanding sejenis** (anonim, sejenis dan seukuran) sebagai alasan kembali.
4. **Dokumen berguna:** laporan bulanan sebagai catatan pengelolaan biaya.
5. **Model "lulus":** pengguna stabil pindah ke paket pemeliharaan murah `[Rp5.000–10.000]` dan merujuk usaha lain. Pertumbuhan sebagian datang dari lulusan.
6. **Terbuka:** apakah ini cukup belum diketahui; pantau retensi bulan ke-3 dan ke-6.

---

## 14. Metrik keberhasilan

| Tahap | Metrik | Target (hipotesis) |
|---|---|---|
| Penarikan | Memulai Kios Virtual | `[X]` |
| Keterlibatan | Menyelesaikan Misi Meter hari 7 | `[X]%` |
| Aktivasi | Menghubungkan data asli (mulai trial) | `[X]%` |
| Nilai | Melihat Laporan Pertama; menjalankan ≥1 saran | `[X]%` |
| Konversi | Trial → Pro | `[X]%` |
| Retensi | Aktif bulan ke-2, ke-3 | `[X]%` |
| Dampak | Penurunan kWh per satuan usaha vs baseline | ≈ −10% |
| Kelayakan harga | Hemat terbukti ≥ fee | ≥ 3 dari 5 usaha pilot |
| Kualitas AI | Akurasi OCR, STT; galat estimasi vs sensor | sesuai 12 |
| Ekonomi | Biaya AI per pengguna | < harga Pro |

---

## 15. Rencana rilis

| Fase | Periode | Isi |
|---|---|---|
| **0. Validasi** | Nov 2026 – Jan 2027 | Wawancara hingga 30 UMKM; uji OCR/STT dengan data asli; susun katalog 3 template; keputusan terbuka (10.1, 10.3) |
| **1. MVP** | Jan – Feb 2027 | Epic A, B, C inti, D inti, E1–E4 |
| **2. Pilot berbayar** | Mar – Apr 2027 | Pilot 8 minggu, 5 usaha berbayar; sensor di 2–3 usaha untuk kalibrasi; Pro: E5–E8; uji varian gamifikasi |
| **3. Lanjutan** | Setelah Mei 2027 | Template tambahan, kohort sponsor, sensor/AMI untuk real-time, laporan bank/ESG |

Selaras dengan target tim: akurasi AI diuji paling lambat Januari 2027, pilot paling lambat April 2027, Demo Day Mei 2027.

---

## 16. Risiko

| # | Risiko | Mitigasi |
|---|---|---|
| R1 | Estimasi per alat meleset tanpa sensor | Label estimasi, keyakinan, kategori besar, validasi sensor pilot |
| R2 | Klaim real-time/Jarvis melebihi kemampuan software | Batasi klaim (4.3, 9.2); tandai roadmap |
| R3 | Cakupan "UMKM semua" memecah validasi | 3 template MVP; pilot berbayar tetap fokus 1–2 bidang |
| R4 | Gamifikasi dianggap gimmick; retensi belum terbukti | Hadiah nyata, uji varian, tanpa klaim sebelum data |
| R5 | Garansi disalahgunakan atau hemat tak terbukti | Jangan pakai garansi 2×; trial 30 hari; kredit bersyarat |
| R6 | Margin tipis jika fee hanya menutup biaya AI | Ukur biaya AI di pilot; kendali biaya; sponsor |
| R7 | Pengguna tidak disiplin memotret/mengisi | Input ≤ 2 menit, pengingat, misi pendek |
| R8 | Pengguna prabayar tanpa catat meter bulanan | Input struk token + layar sisa kWh |
| R9 | Privasi data foto/suara/usaha | Persetujuan, hapus data, retensi terbatas |
| R10 | Anggota pengguna tidak percaya angka | Tampilkan metode hitung, estimasi vs terukur |
| R11 | Hadiah nyata butuh mitra/anggaran | Mulai dari kredit langganan dan stiker QR |
| R12 | Estimasi di segmen tagihan kecil tidak menutup fee | Segmen itu hanya game/trial |

---

## 17. Pertanyaan terbuka

1. Berapa persen target memakai prabayar vs pascabayar? (menentukan prioritas prediksi token)
2. Apa yang terjadi setelah trial bila tidak berlangganan (10.1)?
3. Garansi: tidak ada, kredit bersyarat, atau skema lain (10.3)?
4. Bagi hasil di atas fee: dipakai atau tidak? (tim belum sepakat)
5. Mekanisme betah di game dan langganan (7.6).
6. Platform: app mobile atau PWA/WhatsApp-first.
7. Template mana yang menjadi 3 template MVP; siapa yang memverifikasi katalog alat.
8. Hadiah nyata: sumber anggaran dan mitra.
9. Referensi "Pak Pras": fitur apa yang ingin ditiru.
10. Ukuran pasar (jumlah UMKM berdaya listrik tinggi di Semarang) belum bersumber.

---

## 18. Catatan terhadap masukan yang ditempel tim

**Diadopsi:** prinsip freemium yang tidak mengunci kemenangan awal; "Laporan Pertama" sebagai bukti; peringatan penyimpangan, prediksi token, kalkulator ROI, laporan efisiensi sebagai kandidat Pro; sponsor/B2B2C.

**Diubah atau ditunda:**
- **"Deteksi kebocoran 24 jam" dan "satpam listrik real-time"** → di MVP menjadi peringatan berbasis pembacaan harian; real-time menunggu sensor/AMI.
- **Klaim "kebanyakan UMKM prabayar"** → hipotesis; dicek di wawancara.
- **Garansi hemat 2× lipat** → tidak dipakai dulu (10.3).
- **"Laporan untuk KUR/bank"** → hanya sebagai dokumen pendukung sampai dicek ke bank.
- **Patokan harga Rp15–25 ribu** → tetap hipotesis; ditentukan setelah biaya AI terukur dan kemauan bayar diuji.
- Struktur gratis lama (Misi 7 hari + 1 laporan) diganti keputusan tim: game gratis dan trial 30 hari penuh.
