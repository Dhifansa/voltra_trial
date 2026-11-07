# PRD 1 — Aplikasi Sistem Wattera (FE + BE + AI Placeholder + Mobile)

**Versi:** 0.2 · **Tanggal:** 5 November 2026 · **Induk:** `wattera-prd-v0.2-index.md`
**Cakupan:** platform, akun, penangkapan data, trial/langganan, laporan, notifikasi, admin. **Bukan** cakupan: pengalaman game (PRD 2) dan logika AI/angka (PRD 3).

> Hipotesis sampai diuji. `[X]` = belum ditetapkan. ⚠ = perlu keputusan.

## 1. Tujuan

1. Menyediakan aplikasi yang bisa dipakai di ponsel oleh pemilik UMKM dan karyawan dengan input ≤ 2 menit/hari.
2. Menjadi **host** untuk game (PRD 2) dan AI (PRD 3), serta memegang akun, entitlement, trial, pembayaran, laporan.
3. Bisa didemokan **sejak awal dengan AI placeholder**, lalu AI asli dipasang bertahap tanpa mengubah FE.

**Bukan tujuan rilis ini:** sensor/IoT, multi-kios, PPOB, integrasi Gmail, modul air/gas.

## 2. Prinsip desain

- **Mobile-first, WhatsApp-friendly:** UMKM akrab dengan WhatsApp dan voice note.
- **AI sebagai layanan yang bisa ditukar:** FE dan BE hanya bicara ke **AI Gateway**; di belakangnya bisa `mock` atau `live`.
- **Tidak ada angka dari LLM:** semua hasil numerik berasal dari `energy-calc` (kontrak C2).
- **Offline tolerant:** foto/suara masuk antrian lokal saat sinyal lemah.
- **Privasi default:** hapus data dan akun bisa dilakukan sendiri.

## 3. Pengguna dan peran

| Peran | Akses |
|---|---|
| P1 Pemilik | Semua fitur kios sendiri, langganan, laporan |
| P2 Karyawan | Kirim foto/suara, selesaikan misi harian; tidak melihat harga/langganan. ⚠ Akun terpisah (undangan lewat WA) atau berbagi akun pemilik? Usulan: akun karyawan terpisah **fase 2**; MVP berbagi perangkat |
| P3 Admin | Dashboard, biaya AI, akurasi, konfigurasi template, feature flag |
| P4 Sponsor | Fase 3 |

## 4. Platform mobile (⚠ keputusan tim)

| Opsi | Kelebihan | Kekurangan | Cocok bila |
|---|---|---|---|
| **A. PWA (React/Next.js) + pembungkus Capacitor untuk APK** *(rekomendasi)* | Satu basis kode FE untuk web dan Android; tim sudah di web; kamera/mikrofon via browser; instal tanpa Play Store | Notifikasi push di iOS terbatas; animasi game berat perlu hemat | Waktu sempit sampai Demo Day |
| B. React Native / Expo | Native feel, push stabil | Kurva belajar; game 2D perlu pustaka tambahan | Ada anggota berpengalaman RN |
| C. Flutter | Game 2D dan UI konsisten | Bahasa baru bagi tim | Ada anggota berpengalaman Flutter |

**Keputusan sementara:** Opsi A. Pengingat misi memakai **WhatsApp** (opt-in) agar tidak bergantung push.

## 5. Arsitektur

```
┌──────────── Klien (PWA / APK via Capacitor) ───────────┐
│  Shell & Auth │ Game (PRD 2) │ Capture │ Laporan │ Wati │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS (REST + WebSocket untuk status job)
┌──────────────────────────▼──────────────────────────────┐
│ API (modular monolith)                                  │
│  auth │ business │ template │ mission │ capture │ trial  │
│  billing │ report │ notify │ admin │ analytics           │
│                      │                                   │
│               AI Gateway  ──►  adapter mock | adapter live (PRD 3)
│                      │                                   │
│  Worker (antrian): OCR, STT, estimasi, laporan, notifikasi│
└───────┬────────────────┬───────────────┬────────────────┘
   PostgreSQL        Object storage      Redis (antrian, cache)
```

**Rekomendasi stack (bisa disesuaikan):** FE TypeScript + React; BE Node.js (NestJS/Express) atau Python (FastAPI) sebagai *modular monolith*; PostgreSQL; S3-compatible storage; Redis + antrian (BullMQ/Celery); WhatsApp Business API atau penyedia OTP. Alasan monolit modular: tim kecil, waktu singkat, kontrak antar-modul tetap jelas.

## 6. Strategi AI: placeholder → live

### 6.1 Mode AI Gateway

| Mode | Perilaku | Dipakai untuk |
|---|---|---|
| `mock` | Keluaran tetap/skenario dari fixture; label UI **"Contoh"** | Pengembangan FE/BE, demo awal |
| `hybrid` | Sebagian endpoint live (mis. OCR), sisanya mock | Transisi Jan 2027 |
| `live` | Semua endpoint memakai PRD 3 | MVP dan pilot |

Diatur per endpoint lewat **feature flag** (`AI_MODE_<endpoint>=mock|live`).

### 6.2 Persyaratan mock agar tidak menyesatkan (R14)

- Fixture mencakup **kasus gagal**: OCR keyakinan rendah, STT salah dengar, estimasi "belum cukup data".
- Admin bisa memaksa skenario (mis. `force=low_confidence`) untuk menguji UI.
- Tidak boleh ada mock yang menghasilkan hemat Rp pasti; mock selalu mengembalikan **rentang** dan keyakinan.
- Mock tidak dipakai di lingkungan pilot/produksi (dicek di CI).

### 6.3 Antarmuka (ringkas; skema lengkap di PRD 3 §4)

| Endpoint | Input | Output |
|---|---|---|
| `POST /ai/ocr-meter` | foto, tipe meter | `kwh`, `confidence`, `bbox`, `needs_retake` |
| `POST /ai/ocr-label` | foto label alat | `name`, `power_w`, `confidence` |
| `POST /ai/ocr-token` | foto struk/layar token | `date`, `amount_rp`, `kwh`, `remaining_kwh`, `confidence` |
| `POST /ai/stt-extract` | audio, daftar alat | `transcript`, `entries[]`, `confidence`, `confirm_text` |
| `POST /ai/estimate` | kios, jendela waktu | estimasi per alat/kategori + `unexplained_kwh` + keyakinan |
| `POST /ai/recommend` | kios | maks 3 saran + estimasi hemat + keyakinan |
| `POST /ai/explain` | saran/laporan | teks penjelasan (tanpa angka baru) |
| `POST /ai/ask` | pertanyaan Wati | jawaban + sumber data + keyakinan |

Panggilan berat bersifat **asinkron**: API mengembalikan `job_id`, klien memantau lewat WebSocket/polling.

## 7. Kebutuhan fungsional

Prioritas MoSCoW: **M** wajib MVP · **S** penting · **C** opsional · **W** di luar MVP.

### Epic A — Akun, kios, entitlement

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-1.1 | Daftar/masuk dengan WhatsApp + OTP | M | Masuk ulang tanpa isi ulang data; persetujuan kebijakan data tampil dan tercatat bertanggal |
| FR-1.2 | Mode tamu: bermain game tanpa login, simpan lokal, lalu **klaim** saat daftar | M | Progres game tidak hilang setelah daftar |
| FR-1.3 | Profil usaha: nama, jenis (template), tarif/daya PLN (opsional), prabayar/pascabayar | M | Bisa dilewati; bisa diedit |
| FR-1.4 | Entitlement `free` / `trial` / `plus` / `locked` | M | Dicek **di server** setiap panggilan AI; FE hanya menampilkan |
| FR-1.5 | Akun karyawan via undangan | C | Ditunda ke fase 2 (⚠ §3) |

### Epic B — Penangkapan data

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-2.1 | Foto meter pascabayar → hasil OCR | M | Kamera ≤ 3 ketukan; hasil ≤ `[10]` dtk; keyakinan rendah memicu foto ulang |
| FR-2.2 | Foto struk/layar token prabayar | M | Baca tanggal, nominal, kWh; input manual cadangan |
| FR-2.3 | Catatan suara → data terstruktur | M | Selalu ada layar konfirmasi yang bisa diedit sebelum disimpan |
| FR-2.4 | Koreksi hasil baca | M | Koreksi disimpan sebagai label untuk evaluasi akurasi |
| FR-2.5 | Unggah riwayat 3–6 bulan untuk baseline | M | Banyak foto sekaligus; <3 bulan ditandai "sementara" |
| FR-2.6 | Antrian unggah offline | S | Terkirim otomatis saat sinyal kembali; indikator status |
| FR-2.7 | Input teks cadangan untuk semua jenis input | M | Setiap input suara/foto punya jalur teks/manual |

### Epic C — Trial, langganan, pembayaran

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-3.1 | Mesin trial 30 hari | M | Mulai saat **data asli pertama** terhubung; sisa hari tampil; pengingat hari ke-25 (WA/notifikasi) |
| FR-3.2 | Langganan Plus | M | Minimal `[2]` metode (QRIS/transfer via penyedia pembayaran); bukti pembayaran; berhenti kapan saja tanpa penalti |
| FR-3.3 | Status setelah trial tanpa langganan | M | `locked`: game tetap jalan, AI terkunci, riwayat/laporan terakhir bisa diekspor |
| FR-3.4 | Perpanjangan, jeda, pembatalan | S | Perubahan berlaku siklus berikutnya; tercatat |
| FR-3.5 | Garansi kredit | C | ⚠ Menunggu keputusan indeks §4 |

### Epic D — Laporan dan notifikasi

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-4.1 | Laporan Pertama (hari 7) | M | Memuat metode, baseline sementara, estimasi alat, 1–3 saran; bisa dibagikan sebagai gambar/PDF |
| FR-4.2 | Laporan Hasil (hari 30) | M | Hemat Rp/kWh vs baseline, rumus ditampilkan, ajakan berlangganan |
| FR-4.3 | Laporan efisiensi bulanan PDF | C | Ringkasan 3–6 bulan; ⚠ tanpa klaim "diterima bank" |
| FR-4.4 | Pengingat misi & notifikasi penyimpangan | M | Waktu diatur pengguna; opsi mati; maksimal `[2]` per hari |
| FR-4.5 | Tanya Wati (suara/teks) di app | S | UI mikrofon + teks; menampilkan sumber data & keyakinan |

### Epic E — Admin, analitik, privasi

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-5.1 | Dashboard admin | S | Funnel, akurasi OCR/STT dari koreksi, saran disetujui/dijalankan |
| FR-5.2 | Biaya AI per pengguna per bulan | S | Dapat diekspor CSV |
| FR-5.3 | Konfigurasi template & feature flag | S | Admin mengubah katalog/versi template tanpa deploy |
| FR-5.4 | Privasi dan kontrol data | M | Lihat data yang disimpan; hapus akun + semua data; foto/suara tidak dipakai untuk hal lain tanpa persetujuan |
| FR-5.5 | Analitik peristiwa | M | Event funnel pada §10 tercatat tanpa data sensitif |

## 8. Model data (ringkas)

| Entitas | Atribut kunci |
|---|---|
| `user` | id, wa_hash, role, consent_at, created_at |
| `business` | id, owner_id, template_id@versi, tariff_code, billing_type (pre/post), unit_label |
| `appliance` | id, business_id, name, power_w, source (template/label/manual), verified (bool) |
| `capture` | id, business_id, type (meter/token/label/voice), file_ref, status, ocr/stt_result (JSON), confidence, corrected_by_user (JSON) |
| `usage_note` | id, business_id, date, appliance_id, hours, work_volume, unit, source_capture_id |
| `meter_reading` | id, business_id, timestamp, kwh, source_capture_id |
| `estimate` | id, business_id, window, per_appliance[], unexplained_kwh, confidence, engine_version |
| `recommendation` | id, business_id, action_id, est_saving_rp/kwh (rentang), confidence, status (proposed/approved/rejected/snoozed/done), decided_at |
| `mission_event` | lihat PRD 2 §6 |
| `subscription` | id, business_id, state, trial_start/end, plan, payment_ref |
| `report` | id, type, period, file_ref, method_json |
| `ai_usage` | id, business_id, endpoint, cost_estimate, latency, mode (mock/live) |

Semua entitas memiliki `created_at`, `updated_at`, dan `deleted_at` (hapus lunak hanya selama masa retensi yang disetujui, lalu hapus permanen).

## 9. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
|---|---|
| Kemudahan | ≤ 3 ketukan kirim foto/suara; bahasa sehari-hari; huruf besar; ≤ 2 menit/hari |
| Bahasa | Bahasa Indonesia; STT toleran logat dan bising; ada input teks cadangan |
| Performa | Muat awal ≤ `[3]` dtk di 4G; OCR ≤ `[10]` dtk; saran ≤ `[30]` dtk |
| Jaringan | Berjalan di seluler biasa; foto dikompresi sisi klien; antrian offline |
| Ketersediaan | Target `[99%]` selama pilot; antrian tahan restart |
| Keamanan | HTTPS; OTP dibatasi laju; entitlement dicek server; file privat dengan URL bertanda tangan kedaluwarsa |
| Privasi | Persetujuan eksplisit; hapus data atas permintaan; retensi file mentah `[X]` hari; mengikuti prinsip UU PDP; foto meter/suara/data usaha dianggap data pribadi |
| Observabilitas | Log terstruktur, ID korelasi per job AI, alarm saat gagal OCR > `[X]%` |
| Biaya | Biaya AI per pengguna terpantau dan di bawah harga Plus |
| Uji | Contract test untuk C1–C6 di CI; fixture mock = fixture uji |

## 10. Event analitik minimum

`app_open` · `game_start` · `template_selected` · `appliance_replaced_real` · `mission_started/completed` · `trial_started` · `capture_uploaded/failed` · `capture_corrected` · `report_viewed` · `recommendation_decided` · `recommendation_done` · `trial_reminder_sent` · `paywall_viewed` · `subscribed` · `churned` · `account_deleted`.

## 11. Rencana pengiriman (sprint 2 minggu, indikatif)

| Sprint | Periode | Hasil |
|---|---|---|
| S1 | 9–22 Nov | Repo, CI, auth OTP, kerangka FE, AI Gateway **mock**, kontrak C1–C6 beku v0 |
| S2 | 23 Nov – 6 Des | Mode tamu + klaim, profil usaha, entitlement, integrasi game shell (PRD 2) |
| S3 | 7–20 Des | Capture: kamera, unggah, antrian offline; status job; koreksi |
| S4 | 21 Des – 3 Jan | Trial engine, Laporan Pertama (mock→OCR live), notifikasi |
| S5 | 4–17 Jan | AI live untuk OCR/STT; admin dasar; **uji akurasi** (target tim ≤ Jan 2027) |
| S6 | 18–31 Jan | Estimasi + rekomendasi live; Laporan Hasil; privasi/hapus data |
| S7–S8 | Feb | Pembayaran Plus, hardening, MVP internal |

⚠ Tanggal bergantung kapasitas tim 3–4 orang dan keputusan platform (§4).

## 12. Dependensi dan risiko

| Dependensi/Risiko | Mitigasi |
|---|---|
| PRD 3 terlambat | Mock tetap dipakai; FE tidak menunggu |
| Penyedia OTP WhatsApp berbiaya/perlu verifikasi | Cadangan OTP SMS/email; uji sejak S1 |
| Penyedia pembayaran perlu verifikasi bisnis | Mulai pendaftaran sejak S3; untuk demo pakai mode uji |
| Kamera/mikrofon di PWA berbeda per browser | Uji di 5 ponsel Android umum; fallback unggah dari galeri |
| Biaya AI melonjak | Batasi frekuensi per pengguna, cache, batch (PRD 3 §10) |

## 13. Di luar cakupan / terbuka

Multi-kios · sensor/AMI · akun karyawan penuh (fase 2) · pembayaran PPOB · **⚠ keputusan platform §4** · **⚠ penyedia OTP/pembayaran**.
