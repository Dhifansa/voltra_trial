# Voltra --- Product Requirements Document (PRD) Terpadu

**Versi dokumen:** 0.3.1 --- Konsolidasi + audit kelengkapan\
**Tanggal konsolidasi:** 5 November 2026\
**Pemilik:** Tim d1306 (UNNES)\
**Status:** Draft kerja untuk validasi dan implementasi\
**Menggantikan sebagai dokumen kerja:** `voltra-prd-v0.2-index.md`,
`voltra-prd-1-sistem-app.md`, `voltra-prd-2-gamifikasi.md`, dan
`voltra-prd-3-ai-e2e.md`

> **Catatan status:** Semua angka, harga, target, ambang, dan asumsi
> yang belum diuji tetap merupakan hipotesis. Penanda `[X]` berarti
> nilainya belum ditetapkan. Penanda `âš ` berarti membutuhkan keputusan
> atau verifikasi tim. Konsolidasi ini menyatukan dan menghubungkan isi
> dokumen sumber; bukan berarti semua keputusan terbuka otomatis sudah
> disetujui.

------------------------------------------------------------------------

## 0. Cara menggunakan dokumen ini

Dokumen ini menjadi satu sumber acuan untuk produk Voltra dari sisi
pengalaman pengguna, aplikasi, gamifikasi, AI, data, monetisasi, dan
rencana rilis.

### 0.1 Cakupan yang digabungkan

  ---------------------------------------------------------------------
  Area                               Isi yang diatur di dokumen ini
  ---------------------------------- ----------------------------------
  Produk dan strategi                Tujuan, target pengguna, pain
                                     point, keputusan tim, monetisasi,
                                     metrik, risiko

  Aplikasi sistem                    Mobile, akun, profil usaha,
                                     backend, capture data, trial,
                                     langganan, laporan, notifikasi,
                                     admin, privasi

  Gamifikasi                         Kios Virtual, template UMKM,
                                     simulasi, misi, level, hadiah,
                                     Wati di dalam game

  AI dan analitik energi             OCR, STT, estimasi,
                                     cross-validation, keyakinan,
                                     rekomendasi, verifikasi,
                                     peringatan, prediksi token, ROI,
                                     Tanya Wati

  Integrasi                          Kontrak template, pustaka hitung
                                     energi, AI Gateway, mission event,
                                     entitlement, tingkat keyakinan

  Pengiriman                         Roadmap fase, sprint, evaluasi
                                     kualitas, risiko, keputusan
                                     terbuka
  ---------------------------------------------------------------------

### 0.2 Aturan sumber kebenaran

1.  **Platform dan akun** menjadi tanggung jawab aplikasi sistem.
2.  **Pengalaman Kios Virtual, template, misi, progres, dan hadiah**
    menjadi tanggung jawab modul gamifikasi.
3.  **Semua angka energi dan rupiah, estimasi, cross-validation,
    rekomendasi, serta verifikasi** harus mengikuti mesin dan aturan
    AI/energi di dokumen ini.
4.  **Kontrak integrasi** pada Bagian 9 menjadi acuan bersama seluruh
    modul.
5.  Tidak boleh ada rumus energi terpisah di game, backend, laporan,
    atau asisten AI. Semuanya memakai pustaka `energy-calc`.
6.  LLM hanya boleh menjelaskan atau menyusun jawaban dari data yang
    sudah dihitung. LLM tidak boleh membuat angka kWh/Rp baru.
7.  Bila data tidak cukup atau keyakinan rendah, sistem harus
    menyatakannya. Selisih meter tidak boleh dibagi secara paksa ke
    alat-alat.
8.  Tindakan atau rekomendasi tidak dijalankan tanpa persetujuan pemilik
    usaha.

### 0.3 Prioritas kebutuhan

-   **M --- Must:** wajib untuk MVP.
-   **S --- Should:** penting, tetapi dapat menyusul setelah fungsi
    inti.
-   **C --- Could:** opsional.
-   **W --- Won't for now:** di luar cakupan rilis saat ini.

------------------------------------------------------------------------

## 1. Ringkasan produk dan keputusan utama

### 1.1 Tujuan produk

Voltra membantu pemilik UMKM menjawab dua pertanyaan:

-   **Ke mana uang listrik usaha saya pergi?**
-   **Apa yang harus saya ubah agar pemakaian listrik lebih efisien?**

Jawaban ditampilkan dalam bahasa yang dekat dengan pemilik usaha,
terutama Rupiah dan biaya per satuan usaha (misalnya Rp/kg cucian atau
Rp/porsi), disertai estimasi, dasar perhitungan, dan tingkat keyakinan.

Voltra merupakan produk **software-first**. Pada rilis awal, sistem
tidak mengukur konsumsi tiap alat secara langsung dan terus-menerus
karena belum menggunakan sensor/AMI.

### 1.2 Keputusan tim yang menjadi dasar desain

  ---------------------------------------------------------------------
  ID                                 Keputusan
  ---------------------------------- ----------------------------------
  K1                                 Target adalah UMKM secara umum,
                                     bukan hanya laundry.

  K2                                 Kios Virtual/game merupakan
                                     simulasi dan onboarding gratis.
                                     Aplikasi analisis berbasis data
                                     asli menyediakan trial 30 hari,
                                     lalu berbayar melalui paket Plus.

  K3                                 Satu pengguna memiliki satu
                                     kios/ruko pada rilis ini; template
                                     disediakan berdasarkan sub-bidang
                                     usaha.

  K4                                 Estimasi berbasis fisika dan input
                                     pengguna menjadi bahan
                                     cross-validation. Pengumpulan data
                                     nyata dikemas sebagai misi game.

  K5                                 AI/AX digunakan pada sistem
                                     rekomendasi dan asisten Wati/Tanya
                                     Wati.

  K6                                 Personalisasi game memakai konsep
                                     *village builder*: village
                                     merepresentasikan kios/ruko UMKM
                                     pengguna.

  K7                                 Fokus rilis adalah software. AI
                                     dapat dimulai dengan
                                     placeholder/mock, kemudian diganti
                                     layanan live secara bertahap.

  K8                                 Aplikasi harus dapat digunakan
                                     melalui perangkat mobile.
  ---------------------------------------------------------------------

Nama paket berbayar menggunakan istilah **Plus**, bukan Pro.

### 1.3 Batas klaim "real-time"

Tanpa sensor/AMI, Voltra tidak boleh mengklaim dapat melacak konsumsi
setiap alat selama 24 jam.

  -----------------------------------------------------------------------
  Kapabilitas             Status rilis ini        Bahasa yang boleh
                                                  digunakan
  ----------------------- ----------------------- -----------------------
  Analisis setelah input  Didukung. Foto/suara    "Analisis langsung
  baru                    baru memicu pembaruan   setelah Anda mengirim
                          dalam hitungan detik    data."
                          hingga menit,           
                          bergantung proses.      

  Tanya alat paling boros Didukung jika data      "Tanya Wati: alat mana
                          tersedia; jawaban       yang diperkirakan
                          bersumber dan diberi    paling boros?"
                          label estimasi serta    
                          keyakinan.              

  Pelacakan tiap alat 24  Tidak didukung tanpa    Roadmap Plus+ / Fase 3.
  jam                     sensor/AMI.             
  -----------------------------------------------------------------------

**Aturan komunikasi produk:** jangan menyebut analisis berbasis input
sebagai pemantauan per alat real-time. Pelacakan 24 jam hanya boleh
dipromosikan setelah integrasi sensor/AMI tersedia.

### 1.4 Ruang lingkup

**Termasuk dalam produk:** - Kios Virtual gratis dengan simulasi
konsumsi dan biaya listrik. - Template usaha, alat virtual, dan
penggantian alat virtual dengan data alat asli. - Akun, profil usaha,
persetujuan data, entitlement, trial, dan langganan. - Input foto meter,
foto label alat, foto token, catatan suara, dan input manual. - OCR,
STT/ekstraksi, estimasi, cross-validation, rekomendasi, penjelasan, dan
Tanya Wati. - Misi, verifikasi, level, hadiah, laporan, dan
notifikasi. - Admin, analitik produk, pemantauan biaya AI, serta kontrol
privasi.

**Di luar cakupan rilis awal:** - Sensor/IoT/AMI dan pemantauan per alat
real-time. - Multi-kios per pengguna. - PPOB. - Integrasi Gmail. - Modul
air dan gas. - Akun karyawan penuh pada MVP (diusulkan untuk Fase 2). -
Sponsor dan pembiayaan kohort sebagai fitur produk aktif (roadmap).

------------------------------------------------------------------------

## 2. Masalah pengguna, bukti, dan hipotesis

### 2.1 Bukti awal

Bukti awal berasal dari **dua wawancara** dengan pelaku usaha laundry
dan barbershop di sekitar UNNES. Temuan kuat yang muncul adalah pemilik
dapat menduga alat yang paling boros, tetapi belum mengetahui berapa
biaya Rupiahnya, kapan pemborosan terjadi, dan tindakan apa yang
sebaiknya dilakukan.

Temuan lain di bawah ini masih berupa hipotesis dan harus diuji lebih
luas.

### 2.2 Pain point lintas-UMKM

  ----------------------------------------------------------------------------------------
  ID    Pain point dalam Segmen       Status      Fitur jawaban  Aha moment    Fase
        bahasa pemilik                bukti                                    
  ----- ---------------- ------------ ----------- -------------- ------------- -----------
  PP1   "Tagihan naik,   Semua UMKM   Wawancara   Estimasi biaya Melihat biaya MVP
        tapi saya tidak               (2)         per alat/jam   Rupiah per    
        tahu gara-gara                            dalam Rupiah   alat di Kios  
        apa."                                                    Virtual       

  PP2   "Saya tidak mau  Semua UMKM   Hipotesis   Game gratis,   Laporan Hasil MVP
        bayar aplikasi                            trial 30 hari, Hari 30       
        yang belum tentu                          hasil hemat                  
        hemat."                                   terukur                      

  PP3   "Saya tidak      Semua UMKM   Hipotesis   Foto dan suara Satu voice    MVP
        sempat                                    dengan input   note menjadi  
        mencatat."                                maksimal 2     data          
                                                  menit/hari     terstruktur   

  PP4   "Saya tidak tahu Semua UMKM   Wawancara   1--3 saran     Laporan       MVP
        harus ngapain."                           dengan nilai   Pertama Hari  
                                                  Rupiah dan     7             
                                                  langkah jelas                

  PP5   "Alat lupa       Warung,      Hipotesis   Peringatan     Notifikasi    Plus
        dimatikan atau   kafe, roti,              penyimpangan   pertama yang  
        mulai boros,     laundry                  harian         relevan       
        baru ketahuan di                                                       
        akhir bulan."                                                          

  PP6   "Token habis pas Pengguna     Hipotesis   Prediksi token Pengingat     Plus
        ramai."          prabayar                 habis          sebelum token 
                                                                 habis         

  PP7   "Mau ganti alat, Usaha dengan Hipotesis   Kalkulator ROI Rentang waktu Plus
        bingung balik    alat besar                              balik modal   
        modalnya."                                                             

  PP8   "Susah rapikan   Usaha yang   Hipotesis âš  Laporan        Laporan siap  Plus/Fase 3
        biaya buat       mengajukan               efisiensi PDF  dibagikan     
        bank/pembeli."   pembiayaan                                            
  ----------------------------------------------------------------------------------------

### 2.3 Hipotesis yang perlu diuji

  -----------------------------------------------------------------------
  ID                      Hipotesis               Dampak terhadap produk
  ----------------------- ----------------------- -----------------------
  H1                      Pemilik lebih peduli    Menentukan bahasa utama
                          biaya per unit usaha    UI; kWh dapat
                          (Rp/kg, Rp/porsi,       ditempatkan sebagai
                          Rp/loyang) daripada     detail.
                          kWh.                    

  H2                      Karyawan sering menjadi Checklist tutup toko
                          penyebab pemborosan     melalui game mungkin
                          karena alat lupa        bernilai.
                          dimatikan.              

  H3                      Pemilik mau berbagi     Dapat mendukung retensi
                          data bila dapat         dan potensi sponsor.
                          dibandingkan secara     
                          anonim dengan usaha     
                          sejenis.                

  H4                      Momen penawaran paling  Menentukan waktu
                          relevan adalah setelah  komunikasi dan
                          tagihan naik atau       aktivasi.
                          tarif/daya berubah.     
  -----------------------------------------------------------------------

### 2.4 Panduan wawancara Fase 0

Target awal: **30 usaha**.

1.  Berapa tagihan listrik bulan lalu dan bulan sebelumnya? Prabayar
    atau pascabayar?
2.  Alat mana yang menurut Anda paling boros? Berapa Rupiahnya menurut
    Anda?
3.  Kapan terakhir tagihan naik secara mengejutkan? Apa yang Anda
    lakukan?
4.  Siapa yang menyalakan dan mematikan alat? Pernah ada alat yang lupa
    dimatikan?
5.  Apakah Anda mencatat sesuatu setiap hari? Menggunakan buku,
    WhatsApp, atau cara lain?
6.  Berapa Anda bersedia membayar per bulan untuk bukti penghematan
    Rp100 ribu?
7.  Apakah Anda mau mencoba game sederhana selama 2 menit untuk melihat
    simulasi? Mengapa?
8.  Apakah bank, koperasi, atau pembeli pernah meminta catatan biaya
    usaha?

### 2.5 Alasan pengguna mungkin berhenti

-   Pengguna sudah merasa hemat dan merasa sudah tahu caranya.
-   Pengisian data terasa merepotkan.
-   Pengguna tidak percaya pada angka estimasi.
-   Harga Plus terasa terlalu berat.

Mitigasi harus datang dari pengisian singkat, transparansi
rumus/keyakinan, bukti hasil, dan fitur pemeliharaan nilai setelah usaha
mencapai kondisi hemat.

**Catatan segmen:** usaha dengan tagihan listrik kecil (indikasi awal di
bawah `[Rp500 ribu]`) mungkin menghasilkan penghematan 10% yang lebih
kecil daripada biaya Plus. Segmen ini dapat lebih cocok sebagai pengguna
game/trial dan sumber data sampai kelayakan harga terbukti.

------------------------------------------------------------------------

## 3. Pengguna, peran, dan hak akses

  ------------------------------------------------------------------------
  ID                Peran             Hak akses utama   Batasan
  ----------------- ----------------- ----------------- ------------------
  P1                Pemilik           Mengelola         Menjadi pengambil
                                      kios/usaha        keputusan utama
                                      sendiri, alat,    atas data dan
                                      data, misi,       tindakan usaha.
                                      langganan,        
                                      laporan, dan      
                                      persetujuan       
                                      rekomendasi.      

  P2                Karyawan          Mengirim          Tidak melihat
                                      foto/suara dan    harga
                                      menyelesaikan     paket/langganan.
                                      misi harian.      Akun terpisah
                                                        diusulkan untuk
                                                        Fase 2; MVP dapat
                                                        memakai perangkat
                                                        bersama.

  P3                Admin             Dashboard funnel, Akses harus
                                      biaya AI,         dibatasi sesuai
                                      akurasi,          tugas admin dan
                                      konfigurasi       tercatat.
                                      template, dan     
                                      feature flag.     

  P4                Sponsor           Potensi akses     Belum termasuk
                                      program/kohort    MVP.
                                      pada Fase 3.      
  ------------------------------------------------------------------------

**Keputusan terbuka:** akun karyawan pada MVP menggunakan perangkat/akun
bersama atau undangan akun terpisah. Usulan awal adalah akun karyawan
terpisah pada Fase 2.

------------------------------------------------------------------------

## 4. Model produk dan perjalanan pengguna end-to-end

### 4.1 Hubungan antarbagian produk

Voltra terdiri dari tiga lapisan yang bekerja sebagai satu alur:

1.  **Kios Virtual** memperkenalkan konsep biaya listrik per alat
    melalui simulasi.
2.  **Aplikasi sistem** menyimpan akun, profil usaha, alat, foto/suara,
    pembacaan meter, misi, langganan, dan laporan.
3.  **Mesin AI dan energi** mengubah input menjadi data terstruktur,
    menghitung estimasi, membandingkan dengan meter, lalu menghasilkan
    saran yang dapat diverifikasi.

### 4.2 Alur utama dari pengguna baru sampai hasil penghematan

``` text
MASUK / COBA
   |
   v
Mode tamu atau daftar
   |
   v
Pilih sub-bidang usaha
   |
   v
Kios Virtual dibuat dari template
   |
   v
Geser jam pakai -> lihat biaya Simulasi (Rp)
   |
   v
Ganti alat virtual dengan alat asli (foto label / manual / suara)
   |
   v
Hubungkan data asli -> trial 30 hari dimulai
   |
   v
Misi M1-M4: foto label, foto meter, catatan suara, konfirmasi tebakan
   |
   v
Aplikasi menyimpan data -> AI Gateway memproses OCR/STT
   |
   v
Pengguna mengonfirmasi atau mengoreksi hasil ekstraksi
   |
   v
energy-calc menghitung estimasi per alat/kategori
   |
   v
Cross-validation dengan selisih meter
   |
   +--> Keyakinan rendah: tampil kategori / belum cukup data + misi lanjutan
   |
   v
Laporan Pertama (Hari 7) + maksimal 3 rekomendasi
   |
   v
Pemilik memilih Setuju / Tolak / Tunda
   |
   v
Pemilik menjalankan saran
   |
   v
Data periode berikutnya dibandingkan dengan baseline
   |
   v
Verifikasi hasil -> laporan Hari 30 -> pembaruan prioritas dan progres game
   |
   +--> Berlangganan Plus: analisis berlanjut
   |
   +--> Tidak berlangganan: game tetap gratis; analisis AI terkunci
```

### 4.3 Tahapan pengalaman dan status paket

  -----------------------------------------------------------------------
  Tahap           Aktivitas       Sistem yang bekerja Hasil
                  pengguna                            
  --------------- --------------- ------------------- -------------------
  A --- Gratis    Main Kios       Game, template,     Memahami biaya
                  Virtual tanpa   `energy-calc`       listrik per alat
                  data asli;      dengan label        tanpa biaya dan
                  memilih         Simulasi.           tanpa data usaha
                  template;                           asli.
                  mencoba                             
                  simulasi.                           

  B --- Aktivasi  Mengganti alat  Akun, profil usaha, Trial 30 hari
  trial           virtual dengan  capture,            dimulai saat data
                  data asli dan   persetujuan, mesin  asli pertama
                  menghubungkan   trial.              terhubung.
                  data pertama.                       

  C --- Hari 1--7 Menyelesaikan   OCR/STT,            Data berlabel dan
                  misi meter dan  konfirmasi,         Laporan Pertama.
                  catatan         penyimpanan,        
                  pemakaian.      estimasi,           
                                  cross-validation.   

  D --- Hari 7    Membaca         Rekomendasi         Pemilik memahami
                  estimasi dan    berbasis            peluang penghematan
                  1--3 saran.     aturan/skor;        dan memilih
                                  penjelasan Wati.    tindakan.

  E --- Hari      Menggunakan     P11--P13 dan        Pemantauan berbasis
  8--30           fitur Plus      layanan Plus.       input harian dan
                  selama trial:                       bukti hasil.
                  alert, prediksi                     
                  token, Tanya                        
                  Wati, ROI,                          
                  laporan.                            

  F --- Hari 30   Membaca hasil   Verifikasi          Hasil "terbukti",
                  dibandingkan    `energy-calc`,      "belum terbukti",
                  baseline.       laporan hasil,      atau "tidak cukup
                                  perhitungan efek    data".
                                  tarif/volume.       

  G --- Setelah   Memilih Plus    Entitlement berubah Game tetap gratis;
  trial           atau tidak      menjadi `plus` atau AI terkunci jika
                  melanjutkan.    `locked`.           tidak berlangganan.
  -----------------------------------------------------------------------

Trial berlangsung 30 hari untuk mencakup satu siklus tagihan penuh dan
membandingkan kondisi sebelum/sesudah.

### 4.4 Pemicu pembaruan analisis

Input foto/suara baru dapat memicu job pemrosesan. Setelah OCR/STT dan
konfirmasi selesai, data baru dapat memicu estimasi, cross-validation,
pembaruan rekomendasi, atau laporan. Pemrosesan berat berjalan asinkron
dan statusnya ditampilkan ke klien.

------------------------------------------------------------------------

## 5. Kios Virtual dan gamifikasi

### 5.1 Konsep "Village = Kios Anda"

Pengguna memiliki satu desa mini yang merepresentasikan satu kios/ruko
usaha, dengan gaya *village builder* 2D (tampak isometrik atau samping).
Bangunan di desa adalah alat-alat listrik usaha. Warga/penghuninya
direpresentasikan oleh maskot Wati.

  ---------------------------------------------------------------------
  Elemen game                        Arti di dunia nyata
  ---------------------------------- ----------------------------------
  Kios/ruko atau village             Usaha pengguna

  Alat di kios                       Peralatan listrik usaha

  Alat menyala                       Alat sedang dipakai; menampilkan
                                     biaya Rp/jam

  Lampu, air mancur, hiasan          Dekorasi kosmetik yang diperoleh
                                     sebagai hadiah

  Level kios                         Kualitas data dan hasil hemat yang
                                     sudah diverifikasi

  Cuaca/suasana kios                 Status hemat, normal, atau
                                     lonjakan berdasarkan data
  ---------------------------------------------------------------------

### 5.2 Personalisasi

-   Nama kios.
-   Warna dan tema.
-   Dekorasi.
-   Pilihan 3 gaya maskot.
-   Tata letak alat dengan mekanisme seret-lepas.
-   Foto logo toko secara opsional untuk papan kios.

Personalisasi disimpan lintas perangkat setelah pengguna mengklaim akun.

### 5.3 Onboarding dan aha moment

Alur awal:

1.  Buka aplikasi.
2.  Pilih sub-bidang usaha.
3.  Kios terisi alat dari template.
4.  Geser jam pakai dan lihat angka Rupiah berubah.
5.  Coba tantangan "turunkan tagihan kios 10% tanpa mengurangi jam
    buka".
6.  Dapat ajakan untuk membuat kios virtual menjadi kembaran toko asli
    dengan mengganti alat template.
7.  Mulai misi meter 7 hari dan lanjut ke laporan/trial.

**Target aha moment:** dalam maksimal 90 detik pertama, pengguna melihat
biaya Rupiah pada satu alat dan dapat menurunkannya dengan satu geseran.

### 5.4 Template sub-bidang usaha

  ------------------------------------------------------------------------
  Template          Alat umum (contoh) Satuan usaha      Status
  ----------------- ------------------ ----------------- -----------------
  Laundry           Mesin cuci,        kg cucian         MVP
                    pengering,                           
                    setrika, pompa air                   

  Rumah             Kulkas/freezer,    porsi             MVP
  makan/warung      rice cooker,                         
                    kompor listrik,                      
                    blender, kipas/AC                    

  Toko              Oven, mixer,       loyang/porsi      MVP
  roti/katering     chiller/freezer,                     
                    display cooler                       

  Depot air/es      Kompresor, pompa,  galon/balok       Fase 2
                    UV/ozon, freezer                     

  Kafe/minuman      Mesin kopi,        gelas             Fase 2
                    grinder, freezer,                    
                    AC                                   

  Kustom            Kios kosong;       `[X]`             MVP
                    pengguna menambah                    
                    alat manual                          
  ------------------------------------------------------------------------

Usulan cakupan awal adalah tiga template utama (Laundry, Rumah
makan/warung, Toko roti/katering) ditambah Kustom. Katalog harus disusun
dari spesifikasi produk/sumber resmi dan diverifikasi kepada pelaku
usaha.

### 5.5 Skema template (Kontrak C1)

Contoh berikut merupakan struktur template awal. Nilai contoh bukan
spesifikasi universal semua alat.

``` json
{
  "template_id": "laundry",
  "version": "0.1.0",
  "display_name": "Laundry Kiloan",
  "unit": {
    "id": "kg",
    "label": "kg cucian",
    "default_daily": 50
  },
  "appliances": [
    {
      "id": "dryer_gas_electric",
      "name": "Pengering",
      "icon": "dryer",
      "power_w": {
        "min": 2000,
        "typical": 3000,
        "max": 4500
      },
      "load_factor": {
        "typical": 0.7,
        "range": [0.5, 0.9]
      },
      "usage_pattern": {
        "hours_per_day": {
          "typical": 5,
          "range": [2, 10]
        },
        "always_on": false,
        "peak_hours": ["09-12", "14-17"]
      },
      "category": "heater",
      "critical": false
    }
  ],
  "savings_actions": [
    {
      "id": "full_load_dryer",
      "title": "Isi pengering sampai penuh sebelum menyalakan",
      "applies_to": ["dryer_gas_electric"],
      "saving_formula": "reduce_hours_pct * appliance_kwh",
      "effort": "low",
      "safety_note": "Jangan melebihi kapasitas mesin."
    }
  ],
  "missions_enabled": ["M1", "M2", "M3", "M4", "M5", "M6"]
}
```

Aturan template: - `power_w`, `load_factor`, dan `usage_pattern` adalah
prior awal bagi mesin estimasi. - Kios menyimpan `template_id@versi`. -
Pembaruan template tidak boleh mengubah kios aktif tanpa persetujuan
pengguna. - Nilai daya dan pola pemakaian dari template harus dapat
digantikan data alat asli.

### 5.6 Simulasi

-   Simulasi memakai pustaka `energy-calc` yang sama dengan estimasi
    sistem.
-   Rumus dasar: `kWh = daya(kW) Ã— jam Ã— faktor_beban`;
    `Rp = kWh Ã— tarif`.
-   Tarif simulasi memiliki nilai default yang dapat diubah di
    pengaturan. Nilai tarif harus dikonfirmasi dari sumber resmi PLN dan
    disimpan di konfigurasi, bukan ditulis langsung di kode.
-   UI harus selalu menampilkan label **Simulasi** sampai pengguna
    mengganti ke alat/data asli.
-   Tantangan 10% tidak boleh diselesaikan dengan "mematikan semuanya";
    jam buka usaha harus tetap menjadi batas tantangan.

### 5.7 Misi yang menghubungkan game dengan tindakan nyata

  -----------------------------------------------------------------------------
  ID      Misi         Aksi pengguna   Data berlabel Hadiah             Fase
                                       untuk AI                         
  ------- ------------ --------------- ------------- ------------------ -------
  M1      Foto label   Foto label daya Daya          Alat menjadi       MVP
          alat         alat.           terpasang per "terverifikasi".   
                                       alat.                            

  M2      Misi Meter   Foto meter saat Konsumsi pada Energi dan progres MVP
                       buka dan tutup. jendela       level.             
                                       waktu.                           

  M3      Catatan jam  Voice note      Durasi per    Poin dan dekorasi. MVP
          pakai        berisi alat,    alat dan                         
                       jam, dan volume satuan usaha.                    
                       usaha.                                           

  M4      Konfirmasi   Pengguna        Label         Lencana            MVP
          tebakan      mengonfirmasi   koreksi.      "Detektif".        
                       tebakan AI,                                      
                       misalnya                                         
                       "pengering                                       
                       sekitar `[X]%`,                                  
                       benar?".                                         

  M5      Eksperimen   Mematikan satu  Data kontras. Lencana dan poin.  Pilot
          kecil        alat non-kritis                                  
                       saat istirahat                                   
                       dan memfoto                                      
                       meter.                                           

  M6      Jalankan     Menjalankan     Data          Level naik bila    Pilot
          saran        saran yang      intervensi.   penghematan        
                       disetujui.                    terbukti.          
  -----------------------------------------------------------------------------

**Keselamatan M5:** - Hanya alat dengan `critical:false` pada
template. - Tidak menyentuh kabel atau instalasi. - Tidak mengganggu
layanan usaha. - Panduan harus jelas. - Materi M5 harus ditinjau mentor
sebelum rilis.

### 5.8 Mission Event (Kontrak C4)

``` json
{
  "event_id": "uuid",
  "type": "mission_completed",
  "mission_id": "M2",
  "business_id": "b_123",
  "occurred_at": "2026-12-01T06:30:00+07:00",
  "payload": {
    "capture_id": "c_9",
    "meter_kwh": 12345.6,
    "window": "open"
  },
  "verification": {
    "status": "verified|pending|rejected",
    "reason": null,
    "confidence": "high"
  },
  "reward": {
    "points": 10,
    "badge": null
  }
}
```

-   Event disimpan oleh aplikasi sistem.
-   Mesin AI mengonsumsi event sebagai data berlabel.
-   Hadiah hanya dihitung bila `verification.status = verified`.

### 5.9 Verifikasi misi dan anti-curang

  ---------------------------------------------------------------------
  Risiko                             Kontrol
  ---------------------------------- ----------------------------------
  Foto meter yang sama digunakan     Hash foto dan cek waktu
  ulang                              EXIF/server; tolak duplikat.

  Angka meter turun atau melompat    Bandingkan dengan pembacaan
  tidak wajar                        sebelumnya; tandai perlu
                                     konfirmasi.

  Pengguna mengisi asal demi poin    Poin hanya untuk data dengan
                                     keyakinan minimal Sedang; ada
                                     batas poin harian.

  Pemilik/karyawan mengisi data asal Konfirmasi tebakan M4 dipakai
                                     sebagai uji konsistensi.

  Pengguna hanya mengeklik tanpa     Level tidak naik dari klik; hanya
  tindakan nyata                     dari misi terverifikasi.
  ---------------------------------------------------------------------

### 5.10 Level kios

Level berikut adalah usulan dan harus dikalibrasi dalam pilot.

  -----------------------------------------------------------------------
  Level                   Syarat terverifikasi    Membuka
  ----------------------- ----------------------- -----------------------
  L1 --- Kios Baru        Memilih template.       Simulasi dasar.

  L2                      Minimal 3 alat diganti  Dekorasi dasar dan
                          dengan alat asli        tantangan mingguan.
                          melalui M1.             

  L3                      3 hari Misi Meter (M2)  Laporan Pertama lebih
                          dan 3 catatan suara     dini dan perubahan gaya
                          (M3).                   maskot.

  L4                      Menyelesaikan 7 hari    Laporan Pertama penuh
                          Misi Meter.             dan ajakan trial.

  L5                      Minimal 1 saran         Lencana "Usaha Hemat"
                          dijalankan dan          dan hadiah nyata.
                          penghematan terbukti    
                          (M6).                   
  -----------------------------------------------------------------------

### 5.11 Hadiah, streak, dan pengingat

**Hadiah kosmetik:** dekorasi, tema, dan gaya maskot.

**Hadiah nyata yang diusulkan:** kredit langganan, stiker/QR "Usaha
Hemat Energi", atau voucher mitra. MVP awal diusulkan memakai kredit
langganan dan stiker QR. Hadiah nyata memerlukan anggaran, mitra, aturan
penebusan, dan pencatatan biaya dalam unit economics.

**Streak:** hari libur harus diperhitungkan agar usaha yang tutup tidak
merasa dihukum.

**Pengingat:** melalui WhatsApp/notifikasi, opt-in, dapat dimatikan,
waktu ditentukan pengguna, maksimal `[1]` pengingat misi per hari.
Kebutuhan aplikasi sistem menetapkan maksimal `[2]` notifikasi per hari
secara keseluruhan; batas ini perlu diselaraskan.

### 5.12 Retensi game yang masih perlu diuji

  -----------------------------------------------------------------------
  Kandidat                Ukuran keberhasilan     Fase uji
  ----------------------- ----------------------- -----------------------
  Streak yang             Retensi D7/D30          Pilot
  memperhitungkan hari                            
  libur                                           

  Tantangan bulanan       Aktivasi musiman        Pilot
  (misalnya Ramadan/hari                          
  raya)                                           

  Liga komunitas sejenis  Retensi bulan ke-2/3    Pilot
  usaha secara anonim                             

  Hadiah nyata bertingkat Konversi trial ke Plus  Pilot

  Checklist tutup toko    Keterlibatan karyawan   Pilot, bila wawancara
  untuk karyawan (H2)                             mendukung
  -----------------------------------------------------------------------

Tidak boleh ada klaim bahwa gamifikasi "membuat pengguna betah" sebelum
hasil pengujian tersedia.

------------------------------------------------------------------------

## 6. Aplikasi sistem, platform, dan arsitektur

### 6.1 Prinsip desain aplikasi

-   **Mobile-first dan WhatsApp-friendly:** mendukung foto, mikrofon,
    dan voice note.
-   **AI sebagai layanan yang dapat ditukar:** frontend/backend
    berkomunikasi melalui AI Gateway; adapter dapat berupa mock atau
    live.
-   **Tidak ada angka dari LLM:** angka numerik berasal dari
    `energy-calc`.
-   **Offline tolerant:** foto/suara dapat masuk antrean lokal saat
    jaringan lemah.
-   **Privasi default:** pengguna dapat melihat data yang disimpan dan
    meminta penghapusan akun serta data.

### 6.2 Pilihan platform mobile

  -----------------------------------------------------------------------
  Opsi              Kelebihan         Kekurangan        Cocok bila
  ----------------- ----------------- ----------------- -----------------
  **A. PWA          Satu basis kode   Push notification Waktu menuju Demo
  React/Next.js +   web/Android; tim  iOS terbatas;     Day terbatas.
  Capacitor untuk   sudah menggunakan animasi game      
  APK**             web;              harus hemat.      
  (rekomendasi      kamera/mikrofon                     
  sementara)        melalui browser;                    
                    instalasi tanpa                     
                    Play Store.                         

  B. React          Pengalaman native Kurva belajar;    Ada anggota
  Native/Expo       dan push lebih    game 2D           berpengalaman RN.
                    stabil.           membutuhkan       
                                      pustaka tambahan. 

  C. Flutter        UI dan game 2D    Bahasa baru bagi  Ada anggota
                    konsisten.        tim.              berpengalaman
                                                        Flutter.
  -----------------------------------------------------------------------

Keputusan sementara adalah Opsi A. Pengingat misi diusulkan memakai
WhatsApp opt-in agar tidak bergantung sepenuhnya pada push notification.

### 6.3 Arsitektur sistem

``` text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ KLIEN: PWA / APK VIA CAPACITOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Shell & Auth â”‚ Kios Virtual â”‚ Capture â”‚ Laporan â”‚ Wati     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ HTTPS: REST + WebSocket/polling
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ API â€” MODULAR MONOLITH                                     â”‚
â”‚ auth â”‚ business â”‚ template â”‚ mission â”‚ capture â”‚ trial     â”‚
â”‚ billing â”‚ report â”‚ notify â”‚ admin â”‚ analytics              â”‚
â”‚                                                            â”‚
â”‚ AI Gateway â”€â”€â”€â”€â”€â”€â”€ adapter mock / hybrid / live             â”‚
â”‚                                                            â”‚
â”‚ Worker queue: OCR, STT, estimasi, laporan, notifikasi       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                â”‚                  â”‚                  â”‚
           PostgreSQL       Object Storage       Redis/Queue
```

### 6.4 Rekomendasi stack

Stack masih dapat disesuaikan dengan kapasitas tim.

  ---------------------------------------------------------------------
  Lapisan                            Opsi/rekomendasi
  ---------------------------------- ----------------------------------
  Frontend                           TypeScript + React

  Backend                            Node.js (NestJS/Express) atau
                                     Python (FastAPI), modular monolith

  Database                           PostgreSQL

  File storage                       S3-compatible object storage

  Queue/cache                        Redis + BullMQ (Node.js) atau
                                     Celery (Python)

  OTP                                WhatsApp Business API atau
                                     penyedia OTP; SMS/email sebagai
                                     cadangan

  Pembayaran                         Penyedia pembayaran yang mendukung
                                     minimal dua metode, misalnya QRIS
                                     dan transfer

  Game 2D                            SVG/sprite/Canvas; Phaser atau
                                     engine setara perlu diputuskan

  Komunikasi job                     REST untuk permintaan; WebSocket
                                     atau polling untuk status job
  ---------------------------------------------------------------------

Modular monolith dipilih sebagai rekomendasi karena ukuran tim kecil,
waktu pengembangan singkat, dan kontrak antarmodul tetap dapat dijaga.

### 6.5 AI Gateway: mock, hybrid, live

  -----------------------------------------------------------------------
  Mode                    Perilaku                Penggunaan
  ----------------------- ----------------------- -----------------------
  `mock`                  Mengembalikan           Pengembangan FE/BE dan
                          fixture/skenario tetap; demo awal.
                          UI memberi label        
                          **Contoh**.             

  `hybrid`                Sebagian endpoint live  Transisi Desember
                          (misalnya OCR),         2026--Januari 2027.
                          endpoint lain masih     
                          mock.                   

  `live`                  Endpoint yang dirilis   MVP dan pilot.
                          menggunakan pipeline    
                          AI/energi sebenarnya.   
  -----------------------------------------------------------------------

Mode dikendalikan per endpoint melalui feature flag, misalnya
`AI_MODE_<endpoint>`. Dokumen sumber mencantumkan nilai `mock|live` pada
contoh flag, sedangkan tabel mode juga memiliki `hybrid`; format
konfigurasi final perlu diselaraskan.

### 6.6 Persyaratan mock agar demo tidak menyesatkan

-   Fixture harus mencakup kasus gagal: OCR keyakinan rendah, STT salah
    dengar, dan estimasi "belum cukup data".
-   Admin dapat memaksa skenario, misalnya `force=low_confidence`.
-   Mock tidak boleh menghasilkan nilai penghematan Rupiah yang pasti;
    hasil memakai rentang dan tingkat keyakinan.
-   Mock tidak boleh dipakai di lingkungan pilot/produksi; pemeriksaan
    dilakukan di CI.
-   Semua keluaran mock harus diberi label **Contoh** pada UI.

### 6.7 Pemrosesan asinkron

Panggilan berat seperti OCR, STT, estimasi, dan pembuatan laporan
berjalan melalui worker/antrian. API mengembalikan `job_id`; klien
memantau status melalui WebSocket atau polling. Sistem harus menampilkan
status proses, kegagalan, dan mekanisme coba ulang secara jelas.

------------------------------------------------------------------------

## 7. Kebutuhan fungsional terpadu

### 7.1 Epic A --- Akun, profil usaha, dan entitlement

  ----------------------------------------------------------------------
  ID              Kebutuhan       Prioritas       Kriteria penerimaan
  --------------- --------------- --------------- ----------------------
  FR-1.1          Daftar/masuk    M               Pengguna dapat masuk
                  menggunakan                     kembali tanpa mengisi
                  WhatsApp + OTP.                 ulang data;
                                                  persetujuan kebijakan
                                                  data ditampilkan dan
                                                  dicatat bertanggal.

  FR-1.2          Mode tamu untuk M               Progres disimpan lokal
                  bermain tanpa                   dan dapat diklaim saat
                  login.                          pengguna mendaftar;
                                                  progres tidak hilang
                                                  setelah klaim.

  FR-1.3          Profil usaha.   M               Menyimpan nama,
                                                  jenis/template,
                                                  tarif/daya PLN
                                                  (opsional), dan status
                                                  prabayar/pascabayar;
                                                  field dapat dilewati
                                                  dan diedit.

  FR-1.4          Entitlement     M               Status diperiksa di
                  `free`,                         server pada setiap
                  `trial`,                        panggilan AI; frontend
                  `plus`,                         hanya menampilkan
                  `locked`.                       status.

  FR-1.5          Akun karyawan   C               Ditunda ke Fase 2;
                  melalui                         model akses harus
                  undangan.                       diputuskan.
  ----------------------------------------------------------------------

### 7.2 Epic B --- Penangkapan data dan koreksi

  -----------------------------------------------------------------------
  ID                Kebutuhan         Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  FR-2.1            Foto meter        M                 Kamera maksimal 3
                    pascabayar dan                      ketukan; hasil
                    OCR.                                maksimal `[10]`
                                                        detik; keyakinan
                                                        rendah memicu
                                                        foto ulang atau
                                                        input manual.

  FR-2.2            Foto struk/layar  M                 Membaca tanggal,
                    token prabayar.                     nominal Rupiah,
                                                        kWh, dan/atau
                                                        sisa kWh;
                                                        tersedia input
                                                        manual cadangan.

  FR-2.3            Catatan suara     M                 Hasil selalu
                    menjadi data                        ditampilkan pada
                    terstruktur.                        layar konfirmasi
                                                        yang dapat diedit
                                                        sebelum disimpan.

  FR-2.4            Koreksi hasil     M                 Koreksi pengguna
                    OCR/STT.                            disimpan sebagai
                                                        label untuk
                                                        evaluasi akurasi.

  FR-2.5            Unggah riwayat    M                 Mendukung banyak
                    3--6 bulan untuk                    foto; data kurang
                    baseline.                           dari 3 bulan
                                                        diberi label
                                                        "sementara".

  FR-2.6            Antrean unggah    S                 Data terkirim
                    offline.                            otomatis saat
                                                        jaringan kembali;
                                                        status antrean
                                                        terlihat.

  FR-2.7            Input teks/manual M                 Semua jenis input
                    cadangan.                           foto/suara
                                                        memiliki jalur
                                                        manual.
  -----------------------------------------------------------------------

### 7.3 Epic C --- Kios Virtual dan misi

  -------------------------------------------------------------------------
  ID          Kebutuhan            Prioritas   Kriteria penerimaan
  ----------- -------------------- ----------- ----------------------------
  FR-G1       Memilih template     M           Kios terisi alat dari
              sub-bidang (3                    template versi tertentu.
              template utama +                 
              Kustom).                         

  FR-G2       Menampilkan alat,    M           Perubahan slider memperbarui
              jam pakai, dan                   angka maksimal 100 ms; tidak
              tagihan simulasi                 memerlukan data pribadi.
              Rupiah.                          

  FR-G3       Mengganti alat       M           Nama dan daya terisi, dapat
              bawaan dengan alat               dikoreksi, dan boleh
              asli melalui                     dilewati.
              foto/suara/manual.               

  FR-G4       Personalisasi kios.  S           Nama, tema, dekorasi,
                                               maskot, tata letak tersimpan
                                               lintas perangkat setelah
                                               akun diklaim.

  FR-G5       Menjalankan M1--M4;  M           Event C4 terkirim; hadiah
              M5--M6 untuk pilot.              hanya diberikan setelah
                                               verifikasi.

  FR-G6       Level kios sesuai    S           Level hanya naik dari misi
              syarat progres.                  terverifikasi.

  FR-G7       Hadiah nyata.        C           Hadiah tercatat dan dapat
                                               ditebus; menunggu
                                               anggaran/mitra.

  FR-G8       Wati sebagai         S           Angka hanya berasal dari C2;
              pemandu/penjelas.                label Simulasi/Estimasi
                                               ditampilkan.

  FR-G9       Mode offline untuk   S           Simulasi berjalan tanpa
              simulasi.                        jaringan dan sinkron saat
                                               tersambung.

  FR-G10      Analitik game.       M           Event `game_start`,
                                               `template_selected`,
                                               `appliance_replaced_real`,
                                               `mission_*`, `level_up`, dan
                                               `cta_trial_viewed` tercatat.

  FR-G11      Aksesibilitas game.  M           Huruf besar, kontras tinggi,
                                               ikon disertai teks, dan
                                               tidak mewajibkan suara.
  -------------------------------------------------------------------------

### 7.4 Epic D --- Trial, langganan, dan pembayaran

  -----------------------------------------------------------------------
  ID                Kebutuhan         Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  FR-3.1            Mesin trial 30    M                 Dimulai saat data
                    hari.                               asli pertama
                                                        terhubung; sisa
                                                        hari ditampilkan;
                                                        pengingat hari
                                                        ke-25 dikirim
                                                        melalui
                                                        WA/notifikasi.

  FR-3.2            Langganan Plus.   M                 Minimal `[2]`
                                                        metode pembayaran
                                                        (misalnya
                                                        QRIS/transfer
                                                        melalui
                                                        penyedia); bukti
                                                        pembayaran
                                                        tersimpan;
                                                        berhenti kapan
                                                        saja tanpa
                                                        penalti.

  FR-3.3            Status setelah    M                 Entitlement
                    trial tanpa                         `locked`; game
                    langganan.                          tetap berjalan,
                                                        AI terkunci,
                                                        riwayat/laporan
                                                        terakhir dapat
                                                        diekspor sesuai
                                                        kebijakan.

  FR-3.4            Perpanjangan,     S                 Perubahan berlaku
                    jeda, dan                           pada siklus
                    pembatalan.                         berikutnya dan
                                                        tercatat.

  FR-3.5            Garansi/kredit.   C                 Belum diputuskan;
                                                        lihat Bagian 17.
  -----------------------------------------------------------------------

### 7.5 Epic E --- Laporan, rekomendasi, dan notifikasi

  -----------------------------------------------------------------------
  ID                Kebutuhan         Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  FR-4.1            Laporan Pertama   M                 Memuat metode,
                    Hari 7.                             baseline
                                                        sementara,
                                                        estimasi
                                                        alat/kategori,
                                                        dan 1--3 saran;
                                                        dapat dibagikan
                                                        sebagai
                                                        gambar/PDF.

  FR-4.2            Laporan Hasil     M                 Menampilkan
                    Hari 30.                            perubahan kWh/Rp
                                                        dibanding
                                                        baseline, rumus,
                                                        serta pemisahan
                                                        efek tarif dan
                                                        volume, serta
                                                        ajakan berlangganan.

  FR-4.3            Laporan efisiensi C                 Ringkasan 3--6
                    bulanan PDF.                        bulan; tidak
                                                        boleh mengklaim
                                                        diterima bank.

  FR-4.4            Pengingat misi    M                 Waktu dapat
                    dan notifikasi                      diatur; dapat
                    penyimpangan.                       dimatikan; batas
                                                        notifikasi
                                                        keseluruhan
                                                        maksimal `[2]`
                                                        per hari perlu
                                                        diselaraskan
                                                        dengan batas
                                                        pengingat game.

  FR-4.5            Tanya Wati di     S                 Mendukung
                    aplikasi.                           suara/teks melalui
                                                        UI mikrofon dan
                                                        input teks;
                                                        menampilkan
                                                        sumber data,
                                                        label estimasi,
                                                        dan keyakinan.
  -----------------------------------------------------------------------

### 7.6 Epic F --- Admin, analitik, dan privasi

  -----------------------------------------------------------------------
  ID              Kebutuhan       Prioritas       Kriteria penerimaan
  --------------- --------------- --------------- -----------------------
  FR-5.1          Dashboard       S               Menampilkan funnel,
                  admin.                          akurasi OCR/STT
                                                  berdasarkan koreksi,
                                                  dan status saran
                                                  disetujui/dijalankan.

  FR-5.2          Biaya AI per    S               Biaya dapat dipantau
                  pengguna per                    dan diekspor CSV.
                  bulan.                          

  FR-5.3          Konfigurasi     S               Admin dapat mengubah
                  template dan                    katalog/versi template
                  feature flag.                   tanpa deploy.

  FR-5.4          Privasi dan     M               Pengguna dapat melihat
                  kontrol data.                   data yang disimpan,
                                                  menghapus akun dan
                                                  seluruh data secara
                                                  mandiri, serta
                                                  mengatur persetujuan
                                                  pemakaian data.

  FR-5.5          Analitik        M               Event funnel tercatat
                  peristiwa.                      tanpa memasukkan data
                                                  sensitif ke event
                                                  analitik.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 8. Mesin AI dan logika energi

### 8.1 Tujuan dan prinsip

Tujuan mesin AI adalah menjelaskan aliran biaya listrik usaha dan
memberi saran yang dapat diperiksa, bukan menghasilkan angka yang tampak
pasti tanpa dasar.

Prinsip: 1. **Angka berasal dari rumus, bukan LLM.** Semua kWh/Rp
berasal dari pustaka `energy-calc` yang dapat diaudit. 2. **Estimasi
berbasis fisika dan validasi silang.** Tidak mengandalkan model ML
terlatih sebagai sumber kebenaran sejak awal karena data latih belum
tersedia. 3. **Selisih tidak dibagi paksa.** Energi yang belum
terjelaskan ditampilkan apa adanya. 4. **Keyakinan eksplisit.** Setiap
keluaran memiliki tingkat keyakinan; keyakinan rendah mengubah tampilan
menjadi kategori. 5. **Manusia memutuskan.** Tidak ada tindakan tanpa
persetujuan pemilik. 6. **Dapat dievaluasi.** Setiap keluaran memiliki
ID, versi mesin, dan dapat dikoreksi pengguna.

Pemantauan per alat secara real-time berada di luar cakupan sampai
sensor/AMI tersedia.

### 8.2 Peta pipeline AI

  ------------------------------------------------------------------------------
  ID        Pipeline           Input           Output            Mesin
  --------- ------------------ --------------- ----------------- ---------------
  P1        OCR meter          Foto meter      Angka kWh dan     OCR/vision
                                               keyakinan         

  P2        OCR label alat     Foto label      Nama alat dan     OCR/vision
                                               daya (W)          

  P3        OCR token          Foto            Tanggal, Rupiah,  OCR/vision
                               struk/layar     kWh, sisa kWh     
                               token                             

  P4        STT + ekstraksi    Audio dan       Entri             STT + LLM
                               daftar alat     alat/jam/volume   terbatas dengan
                               kios            terstruktur       skema

  P5        Estimasi per alat  Prior template, kWh per alat      `energy-calc`
                               label, jam                        
                               pakai                             

  P6        Cross-validation   Estimasi        Selisih, energi   `energy-calc`
                               dibanding meter belum             
                                               terjelaskan,      
                                               keyakinan         

  P7        Rekomendasi        Estimasi dan    Maksimal 3 saran  Aturan + skor
                               pustaka aksi    berperingkat      

  P8        Penjelas           Saran/laporan   Teks penjelasan   LLM tanpa angka
                                               1--2 kalimat      baru

  P9        Verifikasi         Baseline dan    Dampak per saran  `energy-calc`
                               periode setelah                   
                               tindakan                          

  P10       Tanya Wati         Pertanyaan dan  Jawaban dengan    LLM + tool
                               data pengguna   sumber            terbatas

  P11       Peringatan         Pembacaan       Notifikasi        Aturan
            penyimpangan       harian                            statistik

  P12       Prediksi token     Riwayat token   Perkiraan habis   Aturan
                               dan sisa kWh    dalam rentang     

  P13       Kalkulator ROI     Estimasi dan    Rentang waktu     `energy-calc`
                               harga alat baru balik modal       
  ------------------------------------------------------------------------------

### 8.3 Sinyal untuk estimasi

  -----------------------------------------------------------------------
  Sinyal          Isi                                     Sumber
  --------------- --------------------------------------- ---------------
  S1 --- Prior    `kWh â‰ˆ daya(kW) Ã— jam Ã— faktor_beban`   Template C1 dan
  fisika                                                  foto label P2

  S2 --- Meter    Selisih angka meter pada jendela waktu  P1 atau M2
                  yang sama                               

  S3 ---          Jam pakai, volume usaha, dan konfirmasi P4, M3, M4
  Pernyataan      tebakan                                 
  pengguna                                                
  -----------------------------------------------------------------------

### 8.4 Urutan prioritas data

1.  Daya dari foto label yang terverifikasi lebih diutamakan daripada
    nilai `typical` template.
2.  Jam dari catatan suara yang telah dikonfirmasi lebih diutamakan
    daripada pola template.
3.  Faktor beban dimulai dari template dan dapat diperbarui melalui
    regresi setelah data memadai.

### 8.5 Tarif listrik

-   Tarif Rp/kWh dibaca dari konfigurasi profil usaha/golongan tarif.
-   Nilai tarif harus diverifikasi dari sumber resmi dan tidak ditulis
    langsung di kode.
-   Perubahan tarif harus dipisahkan dari perubahan pemakaian ketika
    menghitung hasil penghematan.
-   Tarif simulasi dapat diedit pengguna, tetapi harus diberi label
    simulasi.

### 8.6 Aturan estimasi dan cross-validation

Urutan perhitungan: 1. Hitung estimasi per alat menggunakan S1 dan S3.
2. Jumlahkan estimasi. 3. Bandingkan dengan perubahan meter S2 pada
jendela waktu yang sama. 4. Hitung `gap = meter_delta âˆ’ Î£ estimasi`. 5.
Tentukan tingkat keyakinan.

  Kondisi awal                                            Keyakinan
  ------------------------------------------------------- -----------
  `|gap| â‰¤ [15]%` dari meter dan data jam lengkap         Tinggi
  `[15]% < |gap| â‰¤ [35]%` atau sebagian data jam hilang   Sedang
  `|gap| > [35]%` atau data kurang dari `[3]` hari        Rendah

Ambang di atas adalah titik awal dan harus dikalibrasi memakai data
sensor pilot.

**Respons terhadap selisih:** - Gap positif besar: tampilkan "belum
terjelaskan" dan picu pertanyaan/misi seperti M1 foto label, M3 catatan
jam, atau M4 konfirmasi. - Gap negatif besar (estimasi melebihi meter):
kemungkinan jam pakai berlebih atau faktor beban terlalu tinggi;
turunkan keyakinan dan minta konfirmasi jam. - Jangan membagikan gap ke
alat lain hanya agar total estimasi sama dengan meter.

### 8.7 Pembelajaran faktor beban

Setelah `[14â€“30]` hari, faktor beban dapat diperbarui menggunakan
regresi **non-negative least squares**:

`meter_harian = Î£ (daya Ã— jam Ã— faktor_beban_alat) + konstanta_beban_dasar`

-   Faktor beban dibatasi pada `[0, 1]`.
-   Nilai awal berasal dari template.
-   Eksperimen M5 dapat menambah identifikasi.
-   Hasil regresi hanya digunakan bila nilai `RÂ²` dan jumlah hari
    memenuhi ambang `[X]`.
-   Jika syarat tidak terpenuhi, sistem kembali menggunakan prior
    template.

### 8.8 Tampilan berdasarkan keyakinan

  ---------------------------------------------------------------------
  Tingkat keyakinan                  Tampilan
  ---------------------------------- ----------------------------------
  Tinggi/Sedang                      Estimasi per alat, selalu diberi
                                     label **Estimasi**.

  Rendah                             Kategori, misalnya
                                     "pemanas/pengering", "pendingin",
                                     dan "lain-lain/belum terjelaskan".

  Data tidak cukup                   "Belum cukup data" disertai
                                     misi/pertanyaan untuk melengkapi
                                     data.
  ---------------------------------------------------------------------

### 8.9 Contoh hitung ilustratif

Contoh ini bukan data pengguna:

-   Pengering: 3 kW Ã— 5 jam Ã— 0,7 = **10,5 kWh**.
-   Meter naik 28 kWh.
-   Energi belum terjelaskan: 28 âˆ’ 10,5 = **17,5 kWh** atau 62,5%.
-   Karena gap besar, keyakinan rendah dan tampilan turun ke kategori.
-   Setelah pengguna mengonfirmasi kulkas 24 jam (0,15 kW Ã— 24 Ã— 0,4 â‰ˆ
    1,4 kWh) dan setrika (1 kW Ã— 2 Ã— 0,8 = 1,6 kWh), energi belum
    terjelaskan turun menjadi sekitar 14,5 kWh.
-   Sisa gap yang besar menunjukkan alat belum terdata atau jam input
    salah; bukan alasan untuk membagi energi secara paksa.

### 8.10 Rekomendasi (P7)

-   Pustaka aksi disimpan per template C1.
-   Setiap aksi memiliki syarat berlaku, rumus penghematan, tingkat
    usaha, dan catatan keselamatan.
-   Skor awal: `hemat(Rp) Ã— keyakinan Ã— kemudahan`.
-   Pemetaan keyakinan awal: Tinggi = 1,0; Sedang = 0,6; Rendah = 0,3.
    Nilai ini masih perlu kalibrasi `[X]`.
-   Maksimal `[3]` saran aktif.
-   Saran dengan keyakinan rendah tidak diprioritaskan.
-   Penghematan ditampilkan sebagai rentang kWh dan Rupiah, bukan angka
    tunggal yang seolah pasti.
-   Setiap saran menyediakan tindakan, rentang hemat, keyakinan, catatan
    keselamatan, dan tombol **Setuju / Tolak / Tunda**.
-   Keputusan dicatat beserta tanggal.
-   Saran yang ditolak tidak diulang selama `[30]` hari.

Contoh format rekomendasi:

``` json
{
  "recommendations": [
    {
      "id": "rec_1",
      "action_id": "full_load_dryer",
      "title": "Isi pengering penuh sebelum menyala",
      "est_saving": {
        "kwh_month": {"low": 18, "high": 34},
        "rp_month": {"low": 27000, "high": 51000}
      },
      "confidence": "medium",
      "effort": "low",
      "score": 0.62,
      "safety_note": "Jangan melebihi kapasitas mesin."
    }
  ]
}
```

### 8.11 Verifikasi dampak (P9)

-   Baseline menggunakan kWh per satuan usaha (kg/porsi/loyang) dari
    `[3â€“6]` bulan.
-   Bila data kurang dari 3 bulan, baseline diberi label **sementara**.
-   Bandingkan periode setelah saran dijalankan dengan baseline.
-   Pisahkan dampak perubahan tarif dan perubahan volume usaha.
-   Status hasil: **terbukti**, **belum terbukti**, atau **tidak cukup
    data**, disertai rentang.
-   Hasil verifikasi memperbarui prioritas aksi.
-   Hasil ini dapat menjadi umpan balik atas saran yang
    disetujui/ditolak dan memicu progres M6 pada game.

### 8.12 Fitur Plus berbasis software

  -----------------------------------------------------------------------
  Pipeline                Cara kerja              Batas
  ----------------------- ----------------------- -----------------------
  P11 --- Peringatan      Membandingkan pemakaian Bukan pemantauan 24
  penyimpangan            harian dengan pola      jam; pembaruan
                          normal per satuan       berdasarkan data yang
                          usaha, menggunakan      masuk.
                          median Â± `[X]` MAD.     
                          Pengguna dapat menandai 
                          peringatan "tidak       
                          relevan".               

  P12 --- Prediksi token  Rata-rata pemakaian     Hanya untuk pengguna
                          harian dan sisa kWh     prabayar.
                          dari foto layar token   
                          menghasilkan rentang    
                          perkiraan habis.        

  P13 --- Kalkulator ROI  Menggunakan estimasi    Bergantung pada
                          konsumsi, tarif, dan    kualitas estimasi;
                          harga alat baru untuk   semua asumsi harus
                          menghitung rentang      terlihat.
                          balik modal.            

  P10 --- Tanya Wati      Tool use terbatas untuk Tidak boleh mengklaim
                          mengambil estimasi,     data real-time tanpa
                          riwayat penggunaan,     sensor.
                          rekomendasi, dan        
                          prediksi token.         
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 9. Kontrak integrasi, API, dan model data

Bagian ini adalah sumber kebenaran integrasi antarbagian aplikasi, game,
dan AI.

### 9.1 Kontrak antar-modul

  ------------------------------------------------------------------------------
  ID        Kontrak                Pemilik      Pengguna      Bentuk
  --------- ---------------------- ------------ ------------- ------------------
  C1        Template Schema:       Modul Kios   Aplikasi      JSON berversi
            katalog alat, daya,    Virtual      sistem dan    
            satuan usaha, pola                  mesin AI      
            pakai, kategori, aksi                             
            hemat                                             

  C2        Pustaka `energy-calc`: Modul mesin  Game,         Satu modul/paket
            rumus kWh, Rupiah,     energi/AI    backend,      kode atau layanan
            faktor beban,                       laporan       
            estimasi, dan                                     
            verifikasi                                        

  C3        AI Gateway API         Skema        Aplikasi      OpenAPI; mode
                                   dimiliki     sistem dan    mock/hybrid/live
                                   modul AI;    modul game    
                                   host oleh                  
                                   aplikasi                   
                                   sistem                     

  C4        Mission Event:         Modul        Aplikasi      JSON event
            penyelesaian misi      gamifikasi   sistem        
            beserta payload                     menyimpan; AI 
            berlabel                            mengonsumsi   

  C5        Entitlement: `free`,   Aplikasi     Game dan AI   Klaim token auth +
            `trial`, `plus`,       sistem                     pemeriksaan server
            `locked`                                          

  C6        Tingkat keyakinan:     Modul        Aplikasi      Enum + ambang
            Tinggi/Sedang/Rendah   AI/energi    sistem dan    konfigurasi
            dan aturan tampilan                 game          
  ------------------------------------------------------------------------------

**Aturan emas C2:** game tidak boleh memiliki rumus hitung sendiri.
Angka kWh/Rupiah yang muncul di simulasi, estimasi, rekomendasi,
laporan, dan Tanya Wati harus bersumber dari pustaka yang sama.

### 9.2 Katalog endpoint AI

  ---------------------------------------------------------------------------------------
  Endpoint                 Pipeline   Input                          Output utama
  ------------------------ ---------- ------------------------------ --------------------
  `POST /ai/ocr-meter`     P1         Foto dan tipe meter            `kwh`, `confidence`,
                                                                     `bbox`,
                                                                     `needs_retake`

  `POST /ai/ocr-label`     P2         Foto label alat                `name`, `power_w`,
                                                                     `confidence`

  `POST /ai/ocr-token`     P3         Foto struk/layar token         `date`, `amount_rp`,
                                                                     `kwh`,
                                                                     `remaining_kwh`,
                                                                     `confidence`

  `POST /ai/stt-extract`   P4         Audio dan daftar alat          `transcript`,
                                                                     `entries[]`,
                                                                     `confidence`,
                                                                     `confirm_text`

  `POST /ai/estimate`      P5/P6      Kios dan jendela waktu         Estimasi per
                                                                     alat/kategori,
                                                                     `unexplained_kwh`,
                                                                     keyakinan

  `POST /ai/recommend`     P7         Estimasi dan konteks kios      Maksimal 3 saran,
                                                                     estimasi hemat,
                                                                     keyakinan

  `POST /ai/explain`       P8         Objek hasil                    Teks penjelasan
                                      estimasi/rekomendasi/laporan   tanpa angka baru

  `POST /ai/ask`           P10        Pertanyaan Wati                Jawaban, sumber
                                                                     data, keyakinan
  ---------------------------------------------------------------------------------------

P11--P13 adalah layanan/aturan Plus. Bentuk endpoint publik atau
pemanggilan internalnya belum ditetapkan.

### 9.3 Konvensi respons AI

Setiap respons AI harus memuat: - `request_id` - `engine_version` -
`mode` (`mock|live`; dukungan `hybrid` perlu diselaraskan pada kontrak
final) - `confidence` (`high|medium|low`) - `warnings[]`

Contoh spesifik di bawah menampilkan field pipeline utama. Implementasi
OpenAPI harus menetapkan apakah field umum tersebut menjadi envelope
bersama atau diulang pada setiap skema.

### 9.4 Contoh kontrak P1 --- OCR meter

``` json
{
  "request_id": "r_001",
  "engine_version": "ocr-meter-0.1",
  "mode": "live",
  "kwh": 12345.6,
  "unit": "kWh",
  "digits_confidence": [0.99, 0.97, 0.98, 0.95, 0.90, 0.88],
  "confidence": "medium",
  "needs_retake": false,
  "warnings": ["decimal_digit_uncertain"]
}
```

Aturan: - Jika ada digit dengan keyakinan di bawah `[0.85]`, minta foto
ulang atau konfirmasi. - Jika bacaan lebih kecil daripada pembacaan
sebelumnya, minta foto ulang/konfirmasi kecuali pengguna menyatakan
meter diganti. - OCR rendah harus menyediakan input manual.

### 9.5 Contoh kontrak P4 --- STT dan ekstraksi catatan suara

Input mencakup `audio_ref` dan `appliances[]` berisi ID serta nama alat
di kios.

``` json
{
  "transcript": "Hari ini nyuci 40 kilo, pengering nyala dari jam 9 sampai jam 2, setrika dua jam",
  "entries": [
    {
      "appliance_id": "dryer",
      "hours": 5.0,
      "from": "09:00",
      "to": "14:00",
      "conf": 0.88
    },
    {
      "appliance_id": "iron",
      "hours": 2.0,
      "conf": 0.84
    }
  ],
  "work_volume": {
    "value": 40,
    "unit": "kg",
    "conf": 0.95
  },
  "confirm_text": "Pengering 5 jam, setrika 2 jam, cucian 40 kg. Benar?",
  "confidence": "medium",
  "unmatched_terms": []
}
```

Aturan: - Hasil selalu ditampilkan untuk konfirmasi sebelum disimpan. -
Pengguna dapat mengedit hasil. - Istilah yang tidak dikenali masuk
`unmatched_terms` dan tidak boleh ditebak.

### 9.6 Contoh kontrak P5/P6 --- Estimasi dan cross-validation

``` json
{
  "window": {
    "from": "2026-12-01T06:00+07:00",
    "to": "2026-12-02T06:00+07:00"
  },
  "meter_delta_kwh": 28.0,
  "per_appliance": [
    {
      "appliance_id": "dryer",
      "kwh": 10.5,
      "basis": {
        "power_kw": 3.0,
        "hours": 5.0,
        "load_factor": 0.7
      },
      "confidence": "medium"
    }
  ],
  "explained_kwh": 10.5,
  "unexplained_kwh": 17.5,
  "gap_ratio": 0.625,
  "overall_confidence": "low",
  "display_level": "category",
  "next_questions": ["Alat lain apa yang menyala hari ini?"],
  "suggested_missions": ["M1", "M4"]
}
```

`display_level`: - `appliance`: keyakinan cukup untuk menampilkan
estimasi per alat. - `category`: keyakinan rendah; tampilkan kategori.

### 9.7 Contoh kontrak P10 --- Tanya Wati

``` json
{
  "question": "Alat mana paling boros minggu ini?",
  "answer": "Perkiraan terbesar: pengering, sekitar 40â€“45% dari pemakaian yang sudah terjelaskan.",
  "sources": [
    {"type": "estimate", "id": "e_88"},
    {"type": "usage_notes", "range": "7d"}
  ],
  "confidence": "medium",
  "disclaimer": "Estimasi, bukan pengukuran",
  "followup_mission": null
}
```

Setiap jawaban numerik wajib memiliki sumber dan tingkat keyakinan. Bila
data tidak cukup, jawaban yang benar adalah "belum cukup data".

### 9.8 Catatan kelengkapan kontrak

Dokumen sumber menyediakan ringkasan input/output untuk P2 OCR label dan
P3 OCR token, tetapi belum menyediakan contoh JSON lengkap keduanya.
Skema final P2/P3 harus ditambahkan pada OpenAPI sebelum integrasi
produksi. Kontrak P11--P13 juga perlu ditetapkan bila dibuat sebagai
endpoint terpisah.

### 9.9 Model data aplikasi

  ---------------------------------------------------------------------
  Entitas                            Atribut kunci
  ---------------------------------- ----------------------------------
  `user`                             `id`, `wa_hash`, `role`,
                                     `consent_at`, `created_at`

  `business`                         `id`, `owner_id`,
                                     `template_id@version`,
                                     `tariff_code`, `billing_type`
                                     (`pre/post`), `unit_label`

  `appliance`                        `id`, `business_id`, `name`,
                                     `power_w`, `source`
                                     (`template/label/manual`),
                                     `verified`

  `capture`                          `id`, `business_id`, `type`
                                     (`meter/token/label/voice`),
                                     `file_ref`, `status`,
                                     `ocr/stt_result` (JSON),
                                     `confidence`, `corrected_by_user`
                                     (JSON)

  `usage_note`                       `id`, `business_id`, `date`,
                                     `appliance_id`, `hours`,
                                     `work_volume`, `unit`,
                                     `source_capture_id`

  `meter_reading`                    `id`, `business_id`, `timestamp`,
                                     `kwh`, `source_capture_id`

  `estimate`                         `id`, `business_id`, `window`,
                                     `per_appliance[]`,
                                     `unexplained_kwh`, `confidence`,
                                     `engine_version`

  `recommendation`                   `id`, `business_id`, `action_id`,
                                     `est_saving_rp/kwh` (rentang),
                                     `confidence`, `status`,
                                     `decided_at`

  `mission_event`                    Mengikuti Kontrak C4.

  `subscription`                     `id`, `business_id`, `state`,
                                     `trial_start/end`, `plan`,
                                     `payment_ref`

  `report`                           `id`, `type`, `period`,
                                     `file_ref`, `method_json`

  `ai_usage`                         `id`, `business_id`, `endpoint`,
                                     `cost_estimate`, `latency`, `mode`
                                     (`mock/live`)
  ---------------------------------------------------------------------

Semua entitas memiliki `created_at`, `updated_at`, dan `deleted_at`.
Penghapusan lunak hanya berlangsung selama masa retensi yang disetujui;
setelah itu data dihapus permanen sesuai kebijakan.

### 9.10 Pengujian kontrak

-   Contract test untuk C1--C6 dijalankan di CI.
-   Fixture mock digunakan sebagai fixture pengujian.
-   Versi template harus tetap terikat pada kios yang menggunakannya.
-   Perubahan skema harus memiliki versi dan tidak boleh memutus data
    historis.
-   Perubahan kontrak yang memengaruhi lebih dari satu modul harus
    disepakati sebelum implementasi lintas-modul.

------------------------------------------------------------------------

## 10. Wati --- asisten di dalam game dan aplikasi

### 10.1 Peran Wati

  -----------------------------------------------------------------------
  Mode                    Fungsi                  Mesin
  ----------------------- ----------------------- -----------------------
  Pemandu                 Menjelaskan kios,       Skrip + template teks.
                          memberi petunjuk misi,  
                          dan bereaksi terhadap   
                          hasil.                  

  Penjelas                Menjawab "Kenapa        LLM hanya menyusun
                          pengering ini mahal?"   kalimat; angka berasal
                          dengan angka dari       dari C2.
                          `energy-calc`.          

  Penanya                 Mengajukan satu         Aturan + LLM ringan.
                          pertanyaan klarifikasi  
                          bila data ambigu,       
                          misalnya untuk M4.      

  Tanya Wati              Menjawab pertanyaan     P10 `/ai/ask`; tersedia
                          suara/teks berdasarkan  pada trial/Plus untuk
                          data usaha pengguna.    data asli.
  -----------------------------------------------------------------------

### 10.2 Hak akses Wati

-   Paket Gratis: hanya menjawab tentang simulasi dan cara bermain.
-   Trial/Plus: dapat menjawab berdasarkan data asli yang tersedia dan
    entitlement yang sah.
-   Setelah trial tanpa Plus: Tanya Wati atas data asli terkunci.
-   Jawaban numerik wajib menyertakan label **Simulasi** atau
    **Estimasi**, keyakinan, dan sumber.
-   "Belum cukup data" adalah jawaban yang valid.
-   Wati tidak boleh menyarankan tindakan berbahaya atau cara mengakali
    meter/misi.
-   Ekspresi maskot mengikuti status data (hemat/normal/lonjakan), bukan
    keputusan LLM.

### 10.3 Tool use dan keamanan

Tool yang boleh digunakan Wati dibatasi pada: - `get_estimate` -
`get_usage` - `get_recommendations` - `get_token_forecast`

Ketentuan: - LLM tidak boleh menulis SQL bebas. - Semua tool dibatasi
pada `business_id` milik pengguna yang sedang terautentikasi. - Prompt
injection yang muncul dalam catatan suara/teks diperlakukan sebagai data
pengguna, bukan instruksi sistem. - Semua jawaban numerik memiliki
`sources` dan `confidence`. - Tidak ada klaim real-time tanpa
sensor/AMI.

### 10.4 Contoh aturan penjelas

P8 menerima hanya objek hasil P5--P7 yang telah memiliki angka.
Validator memeriksa bahwa teks penjelasan tidak memuat angka baru yang
tidak terdapat dalam input. Jika validator gagal, jawaban LLM diblokir
dan diganti template.

------------------------------------------------------------------------

## 11. Monetisasi, entitlement, dan akses fitur

### 11.1 Paket produk

  -----------------------------------------------------------------------
  Paket                 Isi                   Harga awal
  --------------------- --------------------- ---------------------------
  **Gratis**            Kios Virtual,         Rp0, tanpa batas waktu.
                        simulasi, template,   
                        M1 foto label, hadiah 
                        kosmetik.             

  **Trial 30 hari**     Semua fitur Plus      Rp0 selama 30 hari.
                        untuk menguji         
                        analisis berbasis     
                        data asli.            

  **Plus**              Analisis              `[Rp15.000â€“25.000/bulan]`
                        berkelanjutan,        (hipotesis).
                        peringatan, prediksi  
                        token, ROI, Tanya     
                        Wati, laporan.        

  **Plus+ (roadmap)**   Sensor/AMI dan        `[X]`
                        pemantauan per alat   
                        real-time.            

  **Sponsor (roadmap)** Kohort yang didanai   `[X]`
                        bank/dinas/ESG.       
  -----------------------------------------------------------------------

Aturan awal: - Biaya Plus diusulkan tidak lebih dari `[20]%` dari
penghematan bulanan yang diperkirakan. - Garansi hemat 2Ã— ditunda. Opsi
kredit bersyarat di bulan berbayar pertama masih menunggu keputusan. -
Model "lulus" ke paket pemeliharaan `[Rp5.000â€“10.000]` plus rujukan
merupakan hipotesis retensi, belum menjadi paket final.

### 11.2 Gating fitur game

  -----------------------------------------------------------------------
  Fitur                  Gratis Trial 30 hari          Plus Locked
                                                            setelah trial
  -------------- -------------- ------------- ------------- -------------
  Kios Virtual +             Ya Ya                       Ya Ya
  simulasi                                                  

  Misi M1 foto               Ya Ya                       Ya Ya
  label                                                     

  Misi M2--M6       Tidak; data Ya                       Ya Tidak
  menghasilkan   dapat disimpan                             
  analisis AI      dan analisis                             
                 menunggu trial                             
                         (perlu                             
                   persetujuan)                             

  Hadiah                     Ya Ya                       Ya Hadiah yang
  kosmetik                                                  sudah
                                                            dimiliki
                                                            tetap ada

  Hadiah nyata            Tidak Ya                       Ya Tidak

  Tanya Wati              Tidak Ya                       Ya Tidak
  atas data asli                                            
  -----------------------------------------------------------------------

**Keputusan terbuka:** apakah data M2--M3 yang dikirim sebelum trial
tetap disimpan agar analisis dapat langsung muncul saat trial dimulai.
Usulan awal: ya, dengan persetujuan eksplisit.

### 11.3 Status setelah trial

Usulan awal bila pengguna tidak berlangganan: - Game dan simulasi tetap
gratis. - Analisis AI atas data asli berhenti/terkunci. - Riwayat dan
laporan terakhir dapat diekspor. - Penghapusan data mengikuti kebijakan
retensi dan pilihan pengguna.

Detail periode retensi, cara ekspor, dan perilaku penghapusan setelah
trial harus diputuskan.

------------------------------------------------------------------------

## 12. Kebutuhan non-fungsional, privasi, dan keselamatan

### 12.1 Kemudahan dan aksesibilitas

  ---------------------------------------------------------------------
  Aspek                              Kebutuhan
  ---------------------------------- ----------------------------------
  Input                              Maksimal 3 ketukan untuk mengirim
                                     foto/suara; target input harian
                                     maksimal 2 menit.

  Bahasa                             Bahasa Indonesia sehari-hari; STT
                                     toleran terhadap logat dan
                                     kebisingan; tersedia input teks.

  Visual                             Huruf besar, kontras tinggi, ikon
                                     disertai teks; suara tidak wajib.

  Game                               Sesi maksimal 2 menit; grafis 2D
                                     ringan untuk ponsel Android
                                     menengah-bawah.

  Bahasa UI                          Utamakan Rupiah dan biaya per unit
                                     usaha; kWh dapat ditempatkan
                                     sebagai detail bila hipotesis H1
                                     terbukti.
  ---------------------------------------------------------------------

Catatan keamanan game: game harus aman untuk pengguna dewasa dan tidak
memuat konten judi atau gacha berbayar.

### 12.2 Performa dan jaringan

  ---------------------------------------------------------------------
  Aspek                              Target/ketentuan
  ---------------------------------- ----------------------------------
  Muat awal aplikasi                 Maksimal `[3]` detik di 4G.

  Muat game                          Maksimal `[3]` detik di 4G.

  Ukuran aset game awal              Maksimal `[5]` MB dengan lazy
                                     load.

  FPS game                           Target `[30]` fps.

  Respons slider simulasi            Maksimal 100 ms.

  OCR                                Maksimal `[10]` detik.

  Pembuatan saran                    Maksimal `[30]` detik.

  Ketersediaan                       Target `[99%]` selama pilot.

  Offline                            Simulasi tetap berjalan;
                                     foto/suara dapat masuk antrean
                                     lokal dan disinkronkan saat
                                     jaringan pulih.

  Antrean                            Tahan restart dan mendukung
                                     percobaan ulang.
  ---------------------------------------------------------------------

### 12.3 Keamanan

-   HTTPS untuk komunikasi.
-   OTP memiliki rate limit.
-   Entitlement diperiksa di server, bukan hanya di frontend.
-   File mentah disimpan privat dengan URL bertanda tangan yang
    kedaluwarsa.
-   Job AI memiliki ID korelasi.
-   Akses data usaha dibatasi per `business_id`.
-   Log harus terstruktur dan menghindari data pribadi. Sistem juga
    harus memicu alarm ketika tingkat kegagalan OCR melebihi `[X]%`.
-   Admin dan perubahan konfigurasi harus memiliki pembatasan akses.

### 12.4 Privasi dan pengelolaan data

-   Persetujuan eksplisit ditampilkan dan dicatat.
-   Pengguna dapat melihat data yang disimpan.
-   Pengguna dapat menghapus akun dan seluruh data secara mandiri.
-   Foto, suara, dan data usaha diperlakukan sebagai data pribadi.
-   Foto/suara tidak digunakan untuk tujuan lain atau pelatihan model
    tanpa persetujuan.
-   Retensi file mentah `[X]` hari, menunggu keputusan.
-   Kebijakan harus mengikuti prinsip UU PDP.
-   Penghapusan lunak hanya berlangsung selama masa retensi yang
    disetujui, kemudian penghapusan permanen.
-   Data M2/M3 sebelum trial hanya disimpan untuk analisis berikutnya
    jika pengguna menyetujui dengan jelas.

### 12.5 Keselamatan rekomendasi

-   Jangan mendorong pengguna mengubah instalasi listrik, menyentuh
    kabel, atau membebani instalasi.
-   Eksperimen hanya boleh menyasar alat non-kritis dan harus mengikuti
    panduan.
-   Setiap rekomendasi memuat catatan keselamatan.
-   Wati harus menolak permintaan yang mendorong manipulasi meter, cara
    mengakali misi, atau tindakan berbahaya.
-   Tidak ada tindakan otomatis; pemilik memutuskan.

------------------------------------------------------------------------

## 13. Evaluasi kualitas AI dan pengendalian biaya

### 13.1 Dataset evaluasi awal

  -----------------------------------------------------------------------
  Dataset           Isi               Ukuran awal       Sumber
  ----------------- ----------------- ----------------- -----------------
  D-OCR             Foto meter        Minimal 50 foto   Tim Fase 0;
                    digital, analog,  meter + `[X]`     variasi cahaya
                    prabayar, label   foto label/token. dan sudut.
                    alat, dan token.                    

  D-STT             Voice note dengan Minimal 50 pesan. Pemilik usaha dan
                    logat dan                           tim.
                    kebisingan ruang                    
                    usaha.                              

  D-EST             Usaha pilot       2--3 usaha.       Pilot
                    dengan sensor                       Maret--April
                    arus sebagai                        2027.
                    pembanding.                         
  -----------------------------------------------------------------------

### 13.2 Metrik dan gerbang kualitas

  -----------------------------------------------------------------------
  Komponen                Metrik                  Gerbang MVP
  ----------------------- ----------------------- -----------------------
  P1 OCR meter            Akurasi seluruh digit.  Minimal 90% pada 50
                                                  foto.

  P4 STT/ekstraksi        Entri alat, jam, dan    Minimal 85% pada 50
                          volume yang benar.      pesan.

  P5/P6 estimasi          Galat per alat          Dilaporkan apa adanya;
                          dibanding sensor dan    jika galat per alat
                          galat kategori.         terlalu besar, tampilan
                                                  turun ke kategori.

  P7 rekomendasi          Persentase saran        Dipantau; target `[X]`.
                          disetujui, dijalankan,  
                          dan terbukti.           

  P8 penjelas             Pelanggaran angka baru. 0%; pelanggaran
                                                  otomatis diblokir.

  P10 Tanya Wati          Jawaban bersumber dan   100% memiliki `sources`
                          jujur saat data kurang. atau menyatakan "belum
                                                  cukup data".

  Biaya                   Biaya AI per pengguna   Di bawah harga Plus.
                          per bulan.              

  Latensi                 OCR dan pembuatan       OCR â‰¤ `[10]` detik;
                          saran.                  saran â‰¤ `[30]` detik
                                                  pada p95.
  -----------------------------------------------------------------------

Setiap koreksi pengguna dari FR-2.4 menjadi label evaluasi. Dashboard
admin harus memperlihatkan akurasi berjalan.

### 13.3 Pengendalian biaya AI

-   OCR/STT hanya dipanggil saat ada input.
-   Foto dikompresi di sisi klien.
-   LLM hanya digunakan untuk P8, P10, dan laporan; hasil dapat di-batch
    dan di-cache per estimasi.
-   Batas panggilan LLM per pengguna per hari `[X]`; jika melewati
    batas, gunakan jawaban template.
-   `ai_usage` mencatat biaya estimasi dan latensi setiap panggilan.
-   Pertimbangkan model kecil/murah untuk ekstraksi dan model lebih baik
    untuk penjelasan.
-   Penyedia dan batas biaya per pengguna masih harus diputuskan.

### 13.4 Pilihan teknologi AI yang perlu diuji

  -----------------------------------------------------------------------
  Komponen                Opsi                    Cara memilih
  ----------------------- ----------------------- -----------------------
  OCR/vision              Layanan cloud atau      Uji pada D-OCR;
                          model terbuka.          bandingkan akurasi dan
                                                  biaya.

  STT                     Cloud Bahasa Indonesia  Uji logat Jawa/campuran
                          atau model terbuka.     dan kebisingan.

  LLM                     Penyedia API dengan     Validasi skema ketat
                          keluaran terstruktur.   dan fallback template.

  `energy-calc`           Paket TypeScript/Python Pilih agar game dan
                          bersama atau layanan    backend menggunakan
                          kecil.                  satu sumber rumus.
  -----------------------------------------------------------------------

### 13.5 Tahap penggantian mock ke live

  ------------------------------------------------------------------------
  Tahap          Periode             Endpoint/kapabilitas   Syarat lulus
                                     live                   
  -------------- ------------------- ---------------------- --------------
  T0             November 2026       Semua mock.            Kontrak skema
                                                            dibekukan;
                                                            FE/BE
                                                            terhubung.

  T1             Desember            P1--P3 OCR.            Gerbang
                 2026--Januari 2027                         kualitas OCR.

  T2             Januari 2027        P4 STT dan ekstraksi.  Gerbang
                                                            kualitas STT.

  T3             Januari--Februari   P5--P6 `energy-calc`.  Contoh hitung
                 2027                                       lulus; uji
                                                            data riil tim.

  T4             Februari 2027       P7 rekomendasi dan P8  Tidak ada
                                     penjelas.              pelanggaran
                                                            angka baru.

  T5             Maret--April 2027   P10 Wati, P11--P13     Hasil evaluasi
                                     Plus, kalibrasi sensor pilot.
                                     pilot.                 
  ------------------------------------------------------------------------

Setiap tahap mengubah feature flag endpoint terkait ke live. Mock tetap
tersedia untuk uji/demo dan harus diberi label "Contoh".

### 13.6 Penanganan kegagalan

  ---------------------------------------------------------------------
  Situasi                            Perilaku sistem
  ---------------------------------- ----------------------------------
  OCR keyakinan rendah               Minta foto ulang dan sediakan
                                     input manual.

  STT tidak mengenali istilah        Minta klarifikasi; jangan menebak.

  Meter turun/tidak wajar            Minta konfirmasi; pertimbangkan
                                     kemungkinan penggantian meter.

  Data kurang                        Tampilkan "belum cukup data" dan
                                     misi yang relevan.

  Permintaan berbahaya               Tolak dan jelaskan singkat.

  Penyedia AI gagal/lambat           Masukkan ke antrean ulang; gunakan
                                     template; tampilkan status.

  LLM menghasilkan angka baru        Blokir dengan validator; kirim
                                     template.

  Isu privasi                        Jangan gunakan foto/suara untuk
                                     pelatihan tanpa persetujuan; hapus
                                     sesuai permintaan; log tanpa data
                                     pribadi.
  ---------------------------------------------------------------------

------------------------------------------------------------------------

## 14. Analitik produk dan metrik keberhasilan

### 14.1 Event analitik minimum

Event aplikasi: - `app_open` - `game_start` - `template_selected` -
`appliance_replaced_real` - `mission_started` - `mission_completed` -
`trial_started` - `capture_uploaded` - `capture_failed` -
`capture_corrected` - `report_viewed` - `recommendation_decided` -
`recommendation_done` - `trial_reminder_sent` - `paywall_viewed` -
`subscribed` - `churned` - `account_deleted`

Event game tambahan: - `level_up` - `cta_trial_viewed`

Event harus menghindari data sensitif. Detail payload dan skema event
analitik perlu distandarkan.

### 14.2 Funnel dan target produk

  -----------------------------------------------------------------------
  Tahap                   Metrik                  Target
  ----------------------- ----------------------- -----------------------
  Penarikan               Memulai Kios Virtual.   `[X]`

  Onboarding              Menyelesaikan tutorial  `[X]%`
                          â‰¤90 detik.              

  Keterlibatan            Mengganti minimal satu  `[X]%`
                          alat virtual dengan     
                          alat asli.              

  Keterlibatan            Menyelesaikan Misi      `[X]%`
                          Meter hari ke-7.        

  Aktivasi                Menghubungkan data      `[X]%`
                          asli/memulai trial.     

  Nilai                   Melihat Laporan Pertama `[X]%`
                          dan menjalankan minimal 
                          satu saran.             

  Konversi                Trial ke Plus.          `[X]%`

  Retensi                 Retensi D7/D30.         `[X]` / `[X]%`

  Retensi berbayar        Aktif bulan ke-2 dan    `[X]%`
                          ke-3.                   

  Dampak                  Penurunan kWh per       Sekitar âˆ’10%
                          satuan usaha dibanding  (hipotesis).
                          baseline.               

  Kelayakan harga         Usaha dengan hemat      Minimal 3 dari 5 usaha
                          terbukti â‰¥ biaya paket. pilot.

  Kualitas AI             OCR, STT, dan galat     Mengikuti gerbang
                          estimasi.               Bagian 13.

  Ekonomi                 Biaya AI per pengguna.  Di bawah harga Plus.

  Misi                    Persentase misi dengan  `[X]%`
                          status terverifikasi.   
  -----------------------------------------------------------------------

### 14.3 Metrik game

-   Tutorial selesai dalam â‰¤90 detik.
-   Pemain mengganti minimal satu alat asli.
-   Pemain menyelesaikan Misi Meter hari ke-7.
-   Pemain beralih dari game ke trial.
-   Retensi D7/D30.
-   Persentase misi berstatus terverifikasi; target minimal `â‰¥ [X]%`.

Target kuantitatif masih `[X]` dan harus ditetapkan setelah baseline uji
pengguna.

------------------------------------------------------------------------

## 15. Monetisasi, retensi, dan kelayakan bisnis

### 15.1 Alasan trial 30 hari

Trial 30 hari dirancang untuk mencakup satu siklus tagihan sehingga
Voltra dapat membandingkan hasil terhadap baseline. Trial dimulai saat
data asli pertama kali terhubung, bukan ketika pengguna pertama kali
membuka game.

### 15.2 Retensi setelah pengguna merasa sudah hemat

Kandidat mekanisme retensi: 1. Peringatan penyimpangan agar penghematan
tidak hilang. 2. Saran bertingkat, misalnya beban puncak, perubahan
daya/tarif, dan ROI penggantian alat. 3. Pembanding anonim dengan usaha
sejenis. 4. Laporan bulanan sebagai catatan biaya. 5. Paket pemeliharaan
`[Rp5.000â€“10.000]` dan rujukan. 6. Checklist tutup toko untuk karyawan
jika hipotesis H2 terbukti.

Kecukupan mekanisme ini harus diukur melalui retensi bulan ke-3 dan
ke-6.

### 15.3 Risiko kelayakan harga

-   Jika tagihan usaha kecil, penghematan absolut mungkin tidak cukup
    menutup biaya Plus.
-   Biaya AI per pengguna harus lebih rendah daripada pendapatan paket.
-   Hadiah nyata harus masuk perhitungan unit economics.
-   Fee Plus diusulkan â‰¤`[20]%` dari penghematan bulanan yang
    diperkirakan.
-   Harga, garansi, kredit, dan sponsor belum menjadi keputusan final.

------------------------------------------------------------------------

## 16. Rencana rilis dan pengiriman

### 16.1 Roadmap fase produk

Target tim: AI diuji paling lambat Januari 2027, pilot paling lambat
April 2027, dan Demo Day Mei 2027.

  ------------------------------------------------------------------------
  Fase         Periode      Aplikasi       Gamifikasi   AI/energi
                            sistem                      
  ------------ ------------ -------------- ------------ ------------------
  0 ---        Nov          Kerangka       Prototipe    Kumpulkan â‰¥50 foto
  Validasi     2026--Jan    aplikasi,      Kios Virtual meter dan â‰¥50
               2027         autentikasi,   dengan 1     voice note; uji
                            AI mock.       template.    OCR/STT; susun
                                                        katalog 3
                                                        template.

  1 --- MVP    Jan--Feb     Trial,         3 template,  Estimasi dan
               2027         laporan,       M1--M4,      cross-validation
                            notifikasi,    level.       v0, rekomendasi
                            admin dasar.                v0, AI live
                                                        bertahap.

  2 --- Pilot  Mar--Apr     Langganan Plus Hadiah nyata Sensor pembanding
  berbayar     2027         dan            dan uji      di 2--3 usaha;
                            pembayaran.    varian       alert, token, ROI,
                                           retensi.     Tanya Wati.

  3 ---        Setelah Mei  Multi-kios     Template     Sensor/AMI dan
  Lanjutan     2027         setelah fase   tambahan.    sponsor.
                            lanjutan.                   
  ------------------------------------------------------------------------

### 16.2 Rencana sprint dua minggu

  -----------------------------------------------------------------------
  Sprint                  Periode                 Hasil
  ----------------------- ----------------------- -----------------------
  S1                      9--22 Nov 2026          Repo, CI, auth OTP,
                                                  kerangka FE, AI Gateway
                                                  mock, kontrak C1--C6
                                                  dibekukan v0.

  S2                      23 Nov--6 Des 2026      Mode tamu dan klaim,
                                                  profil usaha,
                                                  entitlement, integrasi
                                                  shell game.

  S3                      7--20 Des 2026          Capture kamera/unggah,
                                                  antrean offline, status
                                                  job, koreksi.

  S4                      21 Des 2026--3 Jan 2027 Trial engine, Laporan
                                                  Pertama, transisi mock
                                                  ke OCR live,
                                                  notifikasi.

  S5                      4--17 Jan 2027          OCR/STT live, admin
                                                  dasar, uji akurasi.

  S6                      18--31 Jan 2027         Estimasi dan
                                                  rekomendasi live,
                                                  Laporan Hasil,
                                                  privasi/penghapusan
                                                  data.

  S7--S8                  Februari 2027           Pembayaran Plus,
                                                  hardening, MVP
                                                  internal.
  -----------------------------------------------------------------------

Tanggal bersifat indikatif dan bergantung pada kapasitas tim 3--4 orang
serta keputusan platform.

------------------------------------------------------------------------

## 17. Risiko dan keputusan terbuka

### 17.1 Daftar risiko terpadu

  -----------------------------------------------------------------------
  ID                      Risiko                  Mitigasi
  ----------------------- ----------------------- -----------------------
  R1                      Estimasi per alat       Label estimasi,
                          meleset tanpa sensor.   keyakinan, tampilan
                                                  kategori, transparansi
                                                  rumus, validasi sensor
                                                  pilot.

  R2                      Klaim real-time/Jarvis  Batasi klaim; bedakan
                          melebihi kemampuan.     analisis setelah input
                                                  dengan sensor 24 jam.

  R3                      Target "semua UMKM"     Batasi MVP pada 3
                          memecah fokus validasi. template dan pilot
                                                  berbayar pada 1--2
                                                  bidang.

  R4                      Gamifikasi dianggap     Hubungkan level dengan
                          gimmick.                tindakan nyata, hadiah,
                                                  dan hasil; ukur melalui
                                                  pilot.

  R5                      Garansi disalahgunakan. Garansi 2Ã— ditunda;
                                                  opsi kredit bersyarat
                                                  perlu keputusan.

  R6                      Margin tipis.           Pantau biaya AI, batasi
                                                  penggunaan, evaluasi
                                                  sponsor.

  R7                      Pengguna tidak disiplin Input maksimal 2
                          mengisi.                menit/hari, misi
                                                  pendek, pengingat
                                                  opt-in.

  R8                      Pengguna prabayar tidak Dukung foto struk/token
                          mencatat meter.         dan layar sisa kWh.

  R9                      Privasi foto/suara/data Persetujuan, retensi
                          usaha.                  terbatas, penghapusan,
                                                  prinsip UU PDP.

  R10                     Pengguna tidak percaya  Tampilkan rumus,
                          angka.                  sumber, estimasi vs
                                                  terukur, dan keyakinan.

  R11                     Hadiah nyata            Mulai dari kredit
                          membutuhkan             langganan dan stiker
                          mitra/anggaran.         QR; batasi per
                                                  pengguna.

  R12                     Segmen tagihan kecil    Posisikan sebagai
                          tidak menutup biaya     pengguna game/trial
                          Plus.                   sampai kelayakan harga
                                                  terbukti.

  R13                     Tiga area kerja         Bekukan C1--C6 per
                          berkembang paralel dan  sprint dan jalankan
                          kontraknya melenceng.   contract test di CI.

  R14                     AI mock terlalu bagus   Label "Contoh", fixture
                          dan membuat demo        kasus gagal, dan
                          menyesatkan.            skenario keyakinan
                                                  rendah.

  R15                     Game memakai rumus      Satu pustaka
                          berbeda dari laporan.   `energy-calc` sebagai
                                                  sumber hitung.

  R16                     PRD/implementasi AI     Mock tetap digunakan
                          terlambat.              agar FE tidak menunggu
                                                  layanan live.

  R17                     Penyedia OTP WhatsApp   Uji sejak S1; siapkan
                          mahal atau memerlukan   SMS/email sebagai
                          verifikasi.             cadangan.

  R18                     Penyedia pembayaran     Mulai pendaftaran sejak
                          memerlukan verifikasi   S3; gunakan mode uji
                          bisnis.                 untuk demo.

  R19                     Kamera/mikrofon PWA     Uji pada 5 ponsel
                          berbeda antarbrowser.   Android umum; sediakan
                                                  unggah galeri dan input
                                                  manual.

  R20                     Biaya AI melonjak.      Batas frekuensi, cache,
                                                  batch, model sesuai
                                                  tugas, pantau
                                                  `ai_usage`.

  R21                     Template daya/pola      Verifikasi dengan
                          salah.                  pelaku usaha, versi
                                                  template, koreksi
                                                  berdasarkan data.

  R22                     Misi diisi asal demi    Verifikasi data, hash
                          poin.                   foto, cek kewajaran,
                                                  batas poin, dan level
                                                  hanya dari misi
                                                  terverifikasi.

  R23                     STT gagal karena        Konfirmasi wajib,
                          logat/kebisingan.       `unmatched_terms`, dan
                                                  input teks cadangan.

  R24                     Regresi faktor beban    Batas nonnegatif,
                          tidak stabil.           ambang jumlah hari/RÂ²,
                                                  dan fallback ke prior.

  R25                     Data pilot terlalu      Laporkan galat apa
                          sedikit untuk menarik   adanya, batasi klaim,
                          kesimpulan kuat.        dan tambah jumlah serta
                                                  variasi data sebelum
                                                  memperluas rilis.
  -----------------------------------------------------------------------

### 17.2 Daftar keputusan terbuka

  ----------------------------------------------------------------------
  ID                   Keputusan yang harus Catatan/status
                       dibuat               
  -------------------- -------------------- ----------------------------
  O1                   Platform final:      PWA + Capacitor adalah
                       PWA + Capacitor,     rekomendasi sementara.
                       React Native/Expo,   
                       atau Flutter.        

  O2                   Tiga template MVP    Usulan: Laundry, Rumah
                       dan pihak yang       makan/warung, Toko
                       memverifikasi        roti/katering + Kustom.
                       katalog.             

  O3                   Satuan usaha untuk   `[X]`.
                       template Kustom.     

  O4                   Engine game: Phaser, Bergantung pada keputusan
                       Canvas, SVG, atau    platform dan kapasitas tim.
                       setara.              

  O5                   Apakah data M2--M3   Usulan: ya, dengan
                       sebelum trial        persetujuan eksplisit.
                       disimpan untuk       
                       analisis saat trial  
                       dimulai?             

  O6                   Akun karyawan pada   Perangkat/akun bersama atau
                       MVP.                 undangan akun terpisah;
                                            usulan akun terpisah Fase 2.

  O7                   Harga Plus final dan Harga awal
                       batas fee terhadap   `[Rp15.000â€“25.000/bulan]`;
                       penghematan.         batas fee `[20]%` masih
                                            hipotesis.

  O8                   Status data setelah  Usulan: game gratis, AI
                       trial tanpa          terkunci, laporan terakhir
                       langganan.           dapat diekspor, data
                                            mengikuti retensi.

  O9                   Garansi hemat 2Ã—     Garansi 2Ã— ditunda; kredit
                       atau kredit          bersyarat belum diputuskan.
                       bersyarat.           

  O10                  Apakah model bagi    Belum diputuskan.
                       hasil di atas fee    
                       digunakan?           

  O11                  Anggaran/mitra       MVP awal diusulkan kredit
                       hadiah nyata.        langganan + stiker QR.

  O12                  Referensi "Pak       Belum teridentifikasi;
                       Pras": fitur village interpretasi saat ini adalah
                       builder spesifik apa village builder.
                       yang dimaksud?       

  O13                  Ukuran pasar UMKM    Belum memiliki sumber.
                       berdaya listrik      
                       tinggi di Semarang.  

  O14                  Persentase target    Berpengaruh pada prioritas
                       pengguna prabayar vs prediksi token.
                       pascabayar.          

  O15                  Penyedia OCR, STT,   Harus diuji pada D-OCR/D-STT
                       dan LLM; cloud atau  dan batas biaya.
                       open source.         

  O16                  Batas biaya AI per   `[X]`.
                       pengguna dan batas   
                       panggilan LLM        
                       harian.              

  O17                  Bahasa               TypeScript/Python atau
                       implementasi/paket   layanan kecil; harus satu
                       `energy-calc`.       sumber hitung.

  O18                  Sumber resmi tarif   Nilai tidak boleh ditulis
                       PLN dan golongan     langsung di kode.
                       tarif yang didukung  
                       MVP.                 

  O19                  Ambang keyakinan     15%/35% adalah titik awal
                       awal P6.             untuk diuji.

  O20                  Ambang jumlah hari   `[X]`.
                       dan RÂ² untuk regresi 
                       faktor beban.        

  O21                  Ambang MAD untuk     `[X]`.
                       peringatan           
                       penyimpangan.        

  O22                  Dataset D-OCR dan    Minimal 50 foto meter,
                       D-STT: penanggung    minimal 50 voice note,
                       jawab, jadwal, dan   target label/token `[X]`;
                       target pengumpulan  tentukan penanggung jawab
                       foto meter/label/    dan jadwal pengumpulan.
                       token serta voice
                       note.         

  O23                  Dua sampai tiga      Target Maret--April 2027.
                       usaha pilot          
                       bersensor: siapa dan 
                       kapan pemasangan.    

  O24                  Ambang level L2--L5  Dikalibrasi di pilot.
                       dan hadiah.          

  O25                  Apakah checklist     Uji melalui wawancara H2.
                       tutup toko untuk     
                       karyawan bernilai?   

  O26                  Apakah liga          Uji retensi dan persetujuan
                       komunitas anonim dan data.
                       pembanding usaha     
                       sejenis              
                       aman/bernilai?       

  O27                  Penyedia OTP dan     Minimal dua metode
                       metode pembayaran.   pembayaran; mulai validasi
                                            sejak awal sprint.

  O28                  Masa retensi file    `[X]`; perlu kebijakan
                       mentah dan prosedur  privasi final.
                       penghapusan          
                       permanen.            

  O29                  Batas notifikasi     PRD aplikasi: maksimal 2;
                       total per hari.      PRD game: maksimal 1
                                            pengingat misi. Perlu aturan
                                            gabungan.

  O30                  Apakah mode `hybrid` Tabel mode mendukung hybrid,
                       menjadi nilai resmi  contoh flag hanya
                       feature flag?        mencantumkan mock/live.

  O31                  Skema OpenAPI        Ringkasan tersedia; JSON
                       lengkap P2 OCR label lengkap belum tersedia.
                       dan P3 OCR token.    

  O32                  Bentuk API/layanan   Belum ditentukan apakah
                       P11--P13.            endpoint terpisah atau
                                            layanan internal.

  O33                  Target kuantitatif   Sebagian besar masih `[X]`.
                       funnel, retensi,     
                       misi terverifikasi,  
                       dan rekomendasi.     

  O34                  Anggaran hadiah,     Harus masuk unit economics.
                       aturan penebusan,    
                       dan biaya per        
                       pengguna.            

  O35                  Model paket          `[Rp5.000â€“10.000]` masih
                       pemeliharaan setelah hipotesis.
                       pengguna "lulus".    
  ----------------------------------------------------------------------

------------------------------------------------------------------------

## 18. Glosarium

  ---------------------------------------------------------------------
  Istilah                            Arti dalam Voltra
  ---------------------------------- ----------------------------------
  Kios Virtual                       Game simulasi yang
                                     merepresentasikan usaha pengguna
                                     sebagai kios/ruko.

  Village builder                    Gaya game membangun dan
                                     mempersonalisasi desa/kios.

  Template                           Data awal sub-bidang usaha yang
                                     berisi alat, daya, faktor beban,
                                     pola pakai, dan aksi hemat.

  `energy-calc`                      Pustaka hitung tunggal untuk kWh,
                                     Rupiah, estimasi, dan verifikasi.

  OCR                                Pengenalan teks/angka dari foto
                                     meter, label, atau token.

  STT                                Speech-to-text, mengubah suara
                                     menjadi teks.

  Cross-validation                   Membandingkan estimasi dari alat
                                     dan input pengguna dengan
                                     perubahan meter.

  Gap / unexplained                  Selisih konsumsi meter dengan
                                     jumlah estimasi alat yang belum
                                     terjelaskan.

  Confidence / keyakinan             Tingkat keandalan keluaran:
                                     Tinggi, Sedang, atau Rendah.

  Baseline                           Kondisi awal pemakaian/biaya yang
                                     menjadi pembanding setelah
                                     tindakan.

  Entitlement                        Hak akses pengguna berdasarkan
                                     status `free`, `trial`, `plus`,
                                     atau `locked`.

  Trial                              Masa uji coba 30 hari setelah data
                                     asli pertama terhubung.

  Plus                               Paket berbayar untuk analisis
                                     berkelanjutan dan fitur lanjutan.

  AMI                                Advanced Metering Infrastructure;
                                     infrastruktur meter/pengukuran
                                     yang dapat mendukung pemantauan
                                     lebih lanjut.

  MAD                                Median Absolute Deviation; ukuran
                                     penyimpangan yang digunakan pada
                                     peringatan statistik.

  ROI                                Return on Investment; perhitungan
                                     rentang balik modal untuk
                                     penggantian alat.

  `business_id`                      Identitas usaha yang membatasi
                                     ruang data dan akses.

  Mission Event                      Event terstruktur yang mencatat
                                     penyelesaian misi dan payload data
                                     berlabel.
  ---------------------------------------------------------------------

------------------------------------------------------------------------

### 19.1 Riwayat perubahan dari v0.1 ke v0.2

-   Paket dokumen dipecah menjadi indeks master dan tiga PRD berdasarkan
    alur kerja tim.
-   Penamaan paket berbayar berubah dari **Pro** menjadi **Plus**.
-   Pain point diperluas dengan kolom *aha moment*, hipotesis H1--H4,
    dan panduan wawancara.
-   Kontrak antar-PRD C1--C6 ditambahkan, bersama risiko R13--R15.
-   PRD aplikasi menambahkan arsitektur, API, model data, strategi AI
    mock ke live, dan opsi platform mobile.
-   PRD gamifikasi menambahkan skema template, mesin misi, aturan level,
    anti-curang, dan peran Wati.
-   PRD AI menambahkan pipeline per langkah, skema JSON, ambang
    keyakinan, rencana evaluasi, dan contoh hitung.

### 19.2 Batas kelengkapan spesifikasi sumber

-   Paket sumber belum menyediakan contoh skema JSON lengkap untuk P2
    (OCR label alat) dan P3 (OCR token). Spesifikasi OpenAPI final untuk
    keduanya masih harus dibuat.
-   Bentuk endpoint/layanan P11--P13 belum diputuskan: dapat menjadi
    endpoint terpisah atau layanan internal.
-   Nilai `[X]`, harga, ambang, target, penyedia teknologi, dan
    keputusan bertanda `âš ` tetap terbuka sampai disetujui atau diuji
    tim.
-   Konsolidasi ini menjaga seluruh kebutuhan substantif dan konteks
    historis yang tersedia pada empat dokumen sumber; dokumen ini belum
    berarti implementasi telah selesai atau tervalidasi di lapangan.

## 19. Catatan konsolidasi dan perubahan dari paket v0.2

Dokumen terpadu ini:

-   Menggabungkan indeks master, PRD aplikasi sistem, PRD gamifikasi,
    dan PRD integrasi AI menjadi satu alur produk.
-   Memindahkan keputusan, kebutuhan, kontrak, risiko, dan pertanyaan
    terbuka ke bagian tematik agar tidak perlu berpindah antarfile.
-   Mempertahankan ID penting seperti K1--K8, PP1--PP8, H1--H4, FR,
    P1--P13, C1--C6, M1--M6, dan R1--R25 (R25 diberi ID saat konsolidasi
    untuk risiko data pilot yang sudah tercantum di PRD AI) agar mudah
    ditelusuri.
-   Menambahkan penjelasan alur data dari Kios Virtual â†’ capture â†’ AI
    Gateway â†’ `energy-calc` â†’ cross-validation â†’ rekomendasi â†’
    persetujuan â†’ verifikasi â†’ laporan/progres game.
-   Menandai ketidaksinkronan atau kontrak yang belum lengkap sebagai
    keputusan terbuka, bukan mengisinya dengan asumsi baru.
-   Mempertahankan nilai `[X]`, harga, target, dan ambang yang belum
    diuji sebagai hipotesis.

**Prinsip akhir:** Voltra harus terasa sebagai satu produk yang utuh
bagi pengguna, meskipun secara teknis dibangun dari modul aplikasi,
game, dan AI yang memiliki tanggung jawab berbeda.