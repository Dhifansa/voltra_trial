# PRD 3 — Integrasi AI End-to-End

**Versi:** 0.2 · **Tanggal:** 5 November 2026 · **Induk:** `wattera-prd-v0.2-index.md`
**Cakupan:** seluruh logika AI dan angka, dari foto/suara pengguna sampai saran terverifikasi, termasuk skema data, ambang keyakinan, evaluasi, dan rencana mengganti *placeholder* dengan AI asli.

> Hipotesis sampai diuji. `[X]` = belum ditetapkan. ⚠ = perlu keputusan.

## 1. Tujuan dan prinsip

**Tujuan:** menjawab "ke mana uang listrik pergi dan apa yang harus diubah" dalam Rupiah, jujur soal ketidakpastian.

**Prinsip**
1. **Angka dari rumus, bukan dari LLM.** Semua kWh/Rp berasal dari pustaka `energy-calc` (C2) yang dapat diaudit.
2. **Estimasi berbasis fisika + validasi silang**, bukan model ML terlatih (tidak ada data latih sejak awal).
3. **Selisih tidak dibagi paksa.** Yang belum terjelaskan ditampilkan sebagai "belum terjelaskan" dan memicu misi.
4. **Keyakinan eksplisit** di setiap keluaran; keyakinan rendah turun ke tampilan kategori.
5. **Manusia memutuskan.** Tidak ada tindakan tanpa persetujuan pemilik.
6. **Bisa dievaluasi:** setiap keluaran punya ID, versi mesin, dan bisa dikoreksi pengguna.

**Di luar cakupan:** pemantauan per alat real-time (butuh sensor/AMI, Fase 3).

## 2. Peta E2E

```
 Foto meter ─┐                                                        ┌─► Laporan (D7, D30)
 Foto label ─┤   P1-P3: OCR      ┌──────────┐   P5      P6           │
 Foto token ─┼──────────────────►│  Data     │──► Estimasi ─► Cross-   ├─► Peringatan
 Suara ──────┘   P4: STT+ekstrak │  terkonfi-│    S1+S3      validasi  │
                  + konfirmasi    │  rmasi    │              vs S2     ├─► Saran (P7) ─► Persetujuan
 Misi game (C4) ───────────────►  └──────────┘      │                 │         │
                                                     ▼                 │         ▼
                                              Keyakinan (C6)           │   Verifikasi (P9) ─► perbarui prioritas
                                                     └─► Penjelas LLM (P8) / Tanya Wati (P10)
```

## 3. Daftar pipeline

| ID | Pipeline | Input | Output | Mesin |
|---|---|---|---|---|
| P1 | OCR meter | foto meter | kWh + keyakinan | OCR/vision |
| P2 | OCR label alat | foto label | nama, daya (W) | OCR/vision |
| P3 | OCR token | foto struk/layar | tanggal, Rp, kWh, sisa kWh | OCR/vision |
| P4 | STT + ekstraksi | audio, daftar alat kios | entri terstruktur | STT + LLM terbatas (skema) |
| P5 | Estimasi per alat | prior template, label, jam pakai | kWh per alat | **`energy-calc`** |
| P6 | Cross-validation | estimasi vs meter | selisih, "belum terjelaskan", keyakinan | **`energy-calc`** |
| P7 | Rekomendasi | estimasi + pustaka aksi | maks 3 saran berperingkat | **Aturan + skor** |
| P8 | Penjelas | saran/laporan | teks 1–2 kalimat | LLM (tanpa angka baru) |
| P9 | Verifikasi | baseline vs periode berikut | dampak per saran | **`energy-calc`** |
| P10 | Tanya Wati | pertanyaan + data pengguna | jawaban bersumber | LLM + alat terbatas (*tool use*) |
| P11 | Peringatan penyimpangan | pembacaan harian | notifikasi | Aturan statistik |
| P12 | Prediksi token | riwayat token + sisa kWh | perkiraan habis (rentang) | Aturan |
| P13 | Kalkulator ROI | estimasi + harga alat baru | rentang balik modal | **`energy-calc`** |

## 4. Kontrak data (skema JSON)

### 4.1 Aturan umum
Setiap respons memuat: `request_id`, `engine_version`, `mode` (`mock|live`), `confidence` (`high|medium|low`), `warnings[]`.

### 4.2 P1 — `/ai/ocr-meter`

```json
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

Aturan: bila ada digit < `[0.85]` atau bacaan lebih kecil dari pembacaan sebelumnya (kecuali penggantian meter) → `needs_retake=true` atau minta konfirmasi.

### 4.3 P4 — `/ai/stt-extract`

Input: `audio_ref`, `appliances[]` (id + nama kios).

```json
{
  "transcript": "Hari ini nyuci 40 kilo, pengering nyala dari jam 9 sampai jam 2, setrika dua jam",
  "entries": [
    {"appliance_id": "dryer", "hours": 5.0, "from": "09:00", "to": "14:00", "conf": 0.88},
    {"appliance_id": "iron", "hours": 2.0, "conf": 0.84}
  ],
  "work_volume": {"value": 40, "unit": "kg", "conf": 0.95},
  "confirm_text": "Pengering 5 jam, setrika 2 jam, cucian 40 kg. Benar?",
  "confidence": "medium",
  "unmatched_terms": []
}
```

Aturan: **selalu** ditampilkan ke pengguna untuk konfirmasi sebelum disimpan; istilah tak dikenali masuk `unmatched_terms` (tidak ditebak).

### 4.4 P5/P6 — `/ai/estimate`

```json
{
  "window": {"from": "2026-12-01T06:00+07:00", "to": "2026-12-02T06:00+07:00"},
  "meter_delta_kwh": 28.0,
  "per_appliance": [
    {"appliance_id": "dryer", "kwh": 10.5, "basis": {"power_kw": 3.0, "hours": 5.0, "load_factor": 0.7}, "confidence": "medium"}
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

`display_level`: `appliance` (keyakinan cukup) atau `category` (rendah, lihat §6.4).

### 4.5 P7 — `/ai/recommend`

```json
{
  "recommendations": [
    {
      "id": "rec_1",
      "action_id": "full_load_dryer",
      "title": "Isi pengering penuh sebelum menyala",
      "est_saving": {"kwh_month": {"low": 18, "high": 34}, "rp_month": {"low": 27000, "high": 51000}},
      "confidence": "medium",
      "effort": "low",
      "score": 0.62,
      "safety_note": "Jangan melebihi kapasitas mesin."
    }
  ]
}
```

### 4.6 P8 — `/ai/explain`

Input hanya objek hasil P5–P7 (angka sudah ada). Keluaran teks; validator memeriksa **tidak ada angka baru** di teks yang tidak ada di input.

### 4.7 P10 — `/ai/ask`

```json
{
  "question": "Alat mana paling boros minggu ini?",
  "answer": "Perkiraan terbesar: pengering, sekitar 40–45% dari pemakaian yang sudah terjelaskan.",
  "sources": [{"type": "estimate", "id": "e_88"}, {"type": "usage_notes", "range": "7d"}],
  "confidence": "medium",
  "disclaimer": "Estimasi, bukan pengukuran",
  "followup_mission": null
}
```

## 5. Mesin estimasi (P5)

### 5.1 Tiga sinyal

| Sinyal | Isi | Sumber |
|---|---|---|
| S1 Prior fisika | `kWh ≈ daya(kW) × jam × faktor_beban` | Template (C1) + foto label (P2) |
| S2 Meter | Selisih angka meter pada jendela waktu | P1 / misi M2 |
| S3 Pernyataan pengguna | Jam pakai, volume, konfirmasi tebakan | P4 / M3 / M4 |

### 5.2 Urutan nilai awal

1. Daya dari **foto label** (terverifikasi) > **template (typical)**.
2. Jam dari **catatan suara** > **pola template**.
3. Faktor beban: awal dari template; **diperbarui** oleh regresi (§6.3).

### 5.3 Tarif
Tarif Rp/kWh dibaca dari konfigurasi per profil usaha (golongan tarif). ⚠ Nilai tarif harus dikutip dari sumber resmi dan tidak ditulis di kode. Efek perubahan tarif **dipisahkan** dari perubahan pemakaian (P9).

## 6. Cross-validation (P6)

### 6.1 Langkah
1. Hitung estimasi per alat (S1+S3).
2. Jumlahkan; bandingkan dengan S2 pada jendela yang sama.
3. `gap = meter_delta − Σ estimasi`.
4. Tentukan keyakinan jendela:

| Kondisi | Keyakinan |
|---|---|
| \|gap\| ≤ `[15]%` dari meter dan data jam lengkap | **Tinggi** |
| `[15]%` < \|gap\| ≤ `[35]%` atau sebagian data jam hilang | **Sedang** |
| \|gap\| > `[35]%` atau data < `[3]` hari | **Rendah** |

(Ambang adalah titik awal; dikalibrasi memakai data sensor pilot.)

### 6.2 Respons terhadap selisih
- `gap` positif besar → tampilkan **"belum terjelaskan"**, picu pertanyaan/misi (M1 foto label, M4 konfirmasi, M3 jam pakai).
- `gap` negatif besar (estimasi > meter) → kemungkinan jam pakai berlebih/faktor beban terlalu tinggi; turunkan keyakinan dan minta konfirmasi jam.

### 6.3 Pembelajaran faktor beban
Setelah `[14–30]` hari: regresi **non-negative least squares** — meter harian = Σ (daya × jam × faktor_beban_alat) + konstanta beban dasar; faktor dibatasi `[0, 1]` dan diinisialisasi dari template. Eksperimen M5 menambah identifikasi. Hasil regresi hanya dipakai bila `R²` dan jumlah hari memenuhi ambang `[X]`.

### 6.4 Tampilan menurut keyakinan

| Keyakinan | Tampilan |
|---|---|
| Tinggi/Sedang | Per alat, berlabel **Estimasi** |
| Rendah | **Kategori**: "pemanas/pengering", "pendingin", "lain-lain/belum terjelaskan" |
| Tidak cukup data | "Belum cukup data" + misi untuk melengkapi |

### 6.5 Contoh hitung (ilustrasi, bukan data)
Pengering 3 kW × 5 jam × 0,7 = **10,5 kWh**. Meter naik 28 kWh → **belum terjelaskan 17,5 kWh** (62,5%) → keyakinan Rendah → tampil kategori + pertanyaan "alat lain apa yang menyala?". Setelah pemilik mengonfirmasi ada kulkas 24 jam (0,15 kW × 24 × 0,4 ≈ 1,4 kWh) dan setrika (1 kW × 2 × 0,8 = 1,6 kWh), yang belum terjelaskan turun menjadi ≈ 14,5 kWh; sisa yang besar menandakan alat belum terdata atau data jam salah, bukan dibagi paksa.

## 7. Rekomendasi (P7)

- **Pustaka aksi** per template (C1): syarat berlaku, rumus hemat dari data pengguna, usaha, catatan keselamatan.
- **Skor** = `hemat(Rp) × keyakinan × kemudahan`; keyakinan dipetakan Tinggi=1,0 / Sedang=0,6 / Rendah=0,3 (`[X]` dikalibrasi).
- Maks `[3]` saran aktif; saran dengan keyakinan Rendah tidak diprioritaskan; tampil **rentang**, bukan satu angka.
- Setiap saran: tindakan, rentang hemat (Rp & kWh), keyakinan, catatan keselamatan, tombol **Setuju / Tolak / Tunda**.
- Keputusan tercatat bertanggal; saran yang ditolak tidak diulang dalam `[30]` hari.

## 8. Verifikasi (P9)

- Baseline: **kWh per satuan usaha** (kg/porsi/loyang) dari `[3–6]` bulan; <3 bulan → "sementara".
- Bandingkan periode setelah saran dijalankan; **pisahkan efek tarif** dan volume.
- Hasil: "terbukti / belum terbukti / tidak cukup data" + rentang.
- Hasil verifikasi memperbarui prioritas aksi (setuju/tolak/terbukti sebagai umpan balik) dan memicu level misi M6 di game.

## 9. Evaluasi dan gerbang kualitas

### 9.1 Dataset
| Dataset | Isi | Ukuran awal | Sumber |
|---|---|---|---|
| D-OCR | Foto meter (digital, analog, prabayar), label, token | ≥ 50 foto meter + `[X]` label/token | Dikumpulkan tim (Fase 0), beragam cahaya/sudut |
| D-STT | Voice note logat & bising ruang usaha | ≥ 50 pesan | Pemilik usaha + tim |
| D-EST | Usaha pilot dengan sensor arus | 2–3 usaha | Pilot Mar–Apr 2027 |

### 9.2 Metrik dan gerbang

| Komponen | Metrik | Gerbang MVP |
|---|---|---|
| P1 OCR meter | Akurasi seluruh digit | ≥ 90% pada 50 foto |
| P4 STT/ekstraksi | Entri benar (alat, jam, volume) | ≥ 85% pada 50 pesan |
| P5/P6 estimasi | Galat per alat vs sensor (pilot); galat kategori | Dilaporkan apa adanya; bila galat alat terlalu besar → tampilan kategori |
| P7 rekomendasi | Persentase disetujui; dijalankan; terbukti | Dipantau, `[X]` |
| P8 penjelas | Pelanggaran "angka baru" | 0% (otomatis diblokir) |
| P10 Wati | Jawaban bersumber & jujur saat data kurang | 100% memiliki `sources` atau "belum cukup data" |
| Biaya | Rp AI per pengguna per bulan | < harga Plus |
| Latensi | OCR ≤ `[10]` dtk; saran ≤ `[30]` dtk | p95 |

### 9.3 Umpan balik
Setiap koreksi pengguna (FR-2.4 PRD 1) menjadi label evaluasi; dashboard admin memperlihatkan akurasi berjalan.

## 10. Pengendalian biaya

- OCR/STT hanya saat ada input; kompres foto di klien.
- LLM hanya untuk **P8, P10, laporan**; dibatch dan di-cache per hasil estimasi.
- Batas per pengguna: `[X]` panggilan LLM/hari; di atas batas → jawaban templat.
- Pencatatan `ai_usage` per panggilan (PRD 1 §8) untuk menghitung unit economics.
- Pertimbangkan model kecil/murah untuk ekstraksi, model lebih baik untuk penjelasan. ⚠ Pilihan penyedia (§11).

## 11. Pilihan teknologi (⚠ keputusan tim)

| Komponen | Opsi | Catatan |
|---|---|---|
| OCR/vision | Layanan cloud vs model terbuka | Uji dengan D-OCR dulu; pilih berdasarkan akurasi + biaya |
| STT | Cloud (mendukung Bahasa Indonesia) vs model terbuka | Uji logat Jawa/campur; bising |
| LLM | Penyedia API; keluaran terstruktur (skema JSON) | Validasi skema ketat; fallback templat |
| Pustaka `energy-calc` | Satu paket (TypeScript/Python) dipakai game & BE | Unit test dengan kasus §6.5; bila BE dan FE berbeda bahasa, bangun sebagai paket TS atau layanan kecil |

## 12. Penggantian placeholder → live

| Tahap | Endpoint live | Syarat lulus |
|---|---|---|
| T0 (Nov) | Semua **mock** | Kontrak skema beku; FE/BE terhubung |
| T1 (Des–Jan) | P1–P3 OCR live | Gerbang §9.2 OCR |
| T2 (Jan) | P4 STT + ekstraksi live | Gerbang §9.2 STT |
| T3 (Jan–Feb) | P5–P6 estimasi (`energy-calc`) live | Contoh §6.5 lulus; uji pada data riil tim |
| T4 (Feb) | P7 rekomendasi + P8 penjelas live | 0 pelanggaran "angka baru" |
| T5 (Mar–Apr) | P10 Wati, P11–P13 (Plus) live; kalibrasi dengan sensor pilot | Evaluasi pilot |

Setiap tahap: ubah `AI_MODE_<endpoint>` ke `live`; mock tetap tersedia untuk uji dan demo berlabel "Contoh".

## 13. Pagar pengaman dan penanganan kegagalan

| Situasi | Perilaku |
|---|---|
| OCR keyakinan rendah | Minta foto ulang; tawarkan input manual |
| STT tidak mengenali istilah | Tanyakan; jangan menebak |
| Meter turun/tak wajar | Minta konfirmasi (mungkin ganti meter) |
| Data kurang | "Belum cukup data" + misi |
| Permintaan berbahaya (mengakali meter, membebani instalasi) | Tolak dan jelaskan singkat |
| Penyedia AI gagal/lambat | Antrian ulang; templat jawaban; status jelas ke pengguna |
| LLM menghasilkan angka baru | Diblokir validator; kirim templat |
| Privasi | Foto/suara tidak dipakai untuk melatih model tanpa persetujuan; hapus sesuai permintaan; log tanpa data pribadi |

## 14. Fitur Plus (kelayakan software-only)

| Fitur | Cara kerja | Batas |
|---|---|---|
| P11 Peringatan penyimpangan | Bandingkan pemakaian harian dengan pola normal per satuan usaha (median ± `[X]` MAD); pengguna bisa menandai "tidak relevan" | "24 jam real-time" butuh sensor; di sini = harian/saat input |
| P12 Prediksi token | Rata-rata pemakaian harian + sisa kWh dari foto layar; keluaran **rentang** | Hanya prabayar |
| P13 Kalkulator ROI | Hemat dari estimasi konsumsi + tarif; waktu balik modal rentang | Bergantung kualitas estimasi; asumsi tampak |
| P10 Tanya Wati | *Tool use* terbatas: `get_estimate`, `get_usage`, `get_recommendations`, `get_token_forecast` | Tanpa klaim real-time |

## 15. Keamanan Wati (P10)

- LLM **tidak** menulis SQL bebas; hanya memanggil alat dengan parameter terbatas dan hanya untuk `business_id` pengguna itu.
- Prompt injection lewat data (catatan suara/teks): isi pengguna diperlakukan sebagai data, bukan instruksi.
- Semua jawaban numerik memuat `sources` dan keyakinan.

## 16. Risiko

| Risiko | Mitigasi |
|---|---|
| Estimasi per alat meleset | Keyakinan, kategori, sensor pilot, transparansi rumus |
| OCR gagal pada meter tertentu | Dataset beragam; foto ulang; input manual |
| Logat/bising merusak STT | Konfirmasi wajib; teks cadangan |
| Biaya LLM | §10 |
| Data pilot sedikit | Laporkan galat apa adanya; turunkan klaim |
| Regresi tidak stabil | Batas nonnegatif, ambang hari/R², jatuh ke prior |
| Pustaka `energy-calc` berbeda antar game dan BE | Satu paket + contract test |

## 17. Pertanyaan terbuka

1. Penyedia OCR/STT/LLM dan batas biaya per pengguna.
2. Ambang keyakinan awal (§6.1) — disetujui sebagai titik awal?
3. Siapa mengumpulkan D-OCR dan D-STT, dan kapan.
4. Bahasa implementasi `energy-calc` agar dipakai game + BE.
5. Sumber resmi tarif PLN dan golongan yang didukung di MVP.
6. Dua sampai tiga usaha pilot bersensor: siapa dan kapan dipasang.
