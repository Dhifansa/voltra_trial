# PRD 2 — Gamifikasi: Kios Virtual (Village Builder UMKM)

**Versi:** 0.2 · **Tanggal:** 5 November 2026 · **Induk:** `wattera-prd-v0.2-index.md`
**Cakupan:** game gratis, template per sub-bidang, misi, progres/hadiah, AI assistant di dalam game. Host dan akun ada di PRD 1; logika angka dan AI ada di PRD 3.

> Hipotesis sampai diuji. `[X]` = belum ditetapkan. ⚠ = perlu keputusan.

## 1. Tujuan dan batas

**Tujuan**
1. Memperkenalkan "listrik per alat dalam Rupiah" **tanpa data asli dan tanpa biaya**.
2. Menurunkan hambatan mencoba produk.
3. **Menghasilkan data berlabel** lewat misi yang menjadi bahan cross-validation (K4).
4. Mengantar pemain ke **trial 30 hari** (aktivasi).

**Batas**
- Gamifikasi **bukan** produk yang dijual; ia pintu masuk.
- Maksimal **2 menit per hari** untuk pemilik yang sibuk.
- Kemajuan virtual harus terhubung ke tindakan nyata atau hasil terverifikasi, bukan sekadar klik.
- **1 kios/ruko per pengguna** (K3).

## 2. Konsep: "Village = Kios Anda"

Pengguna memiliki **satu desa mini = satu kios/ruko**, gaya *village builder* 2D (tampak isometrik/samping). "Bangunan" di desa adalah **alat-alat usaha** (mesin cuci, kulkas, oven, dst.), dan "warga"/penghuninya adalah **maskot Wati**.

| Elemen game | Arti nyata |
|---|---|
| Kios/ruko (village) | Usaha pengguna |
| Alat di kios | Peralatan listrik usaha |
| Alat menyala | Sedang dipakai; menampilkan **Rp/jam** |
| Lampu/air mancur/hiasan | Dekorasi kosmetik (hadiah) |
| Level kios | Kualitas data dan hasil hemat terverifikasi |
| Cuaca/suasana kios | Status hemat/normal/lonjakan (dari data) |

**Personalisasi (K6):** nama kios, warna/tema, dekorasi, maskot (pilih 3 gaya), tata letak alat (seret-lepas), foto logo toko (opsional) yang tampil di papan kios.

## 3. Alur pemain

```
Buka app → Pilih sub-bidang → Kios terisi alat template → Geser jam pakai, lihat Rp berubah
   → Tantangan "turunkan tagihan 10%" → Ajakan "buat kios ini kembaran toko asli" (ganti alat asli)
   → Misi Meter 7 hari (data nyata) → Laporan Pertama → Aktifkan trial (jika belum)
```

**Aha moment target:** dalam ≤ 90 detik pertama pemain melihat angka Rp pada satu alat dan bisa menurunkannya dengan satu geseran.

## 4. Template per sub-bidang (Kontrak C1)

### 4.1 Daftar

| Template | Alat umum (contoh) | Satuan usaha | Status |
|---|---|---|---|
| Laundry | Mesin cuci, pengering, setrika, pompa air | kg cucian | MVP |
| Rumah makan / warung | Kulkas/freezer, rice cooker, kompor listrik, blender, kipas/AC | porsi | MVP |
| Toko roti / katering | Oven, mixer, chiller/freezer, display cooler | loyang / porsi | MVP |
| Depot air/es | Kompresor, pompa, UV/ozon, freezer | galon / balok | Fase 2 |
| Kafe / minuman | Mesin kopi, grinder, freezer, AC | gelas | Fase 2 |
| Kustom | Kios kosong; tambah alat manual | `[X]` | MVP |

⚠ Pertimbangkan **3 template MVP** saja (Laundry, Rumah makan, Toko roti/katering) + Kustom. Katalog disusun tim dari spesifikasi produk/sumber resmi lalu **diverifikasi ke pelaku usaha**.

### 4.2 Skema template (JSON, versi)

```json
{
  "template_id": "laundry",
  "version": "0.1.0",
  "display_name": "Laundry Kiloan",
  "unit": {"id": "kg", "label": "kg cucian", "default_daily": 50},
  "appliances": [
    {
      "id": "dryer_gas_electric",
      "name": "Pengering",
      "icon": "dryer",
      "power_w": {"min": 2000, "typical": 3000, "max": 4500},
      "load_factor": {"typical": 0.7, "range": [0.5, 0.9]},
      "usage_pattern": {"hours_per_day": {"typical": 5, "range": [2, 10]}, "always_on": false, "peak_hours": ["09-12", "14-17"]},
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

Aturan: `power_w`, `load_factor`, dan `usage_pattern` menjadi **prior** untuk mesin estimasi (PRD 3 §5). Pembaruan template tidak boleh mengubah kios aktif tanpa persetujuan pengguna (kios menyimpan `template_id@versi`).

## 5. Simulasi (pemain belum punya data)

- Tagihan simulasi dihitung memakai pustaka **`energy-calc` bersama** (kontrak C2): `kWh = daya(kW) × jam × faktor_beban`, `Rp = kWh × tarif`.
- Tarif simulasi: nilai default yang bisa diubah di pengaturan (⚠ nilai tarif dikonfirmasi dari sumber resmi PLN dan disimpan di konfigurasi, bukan di kode).
- UI selalu menampilkan label **"Simulasi"** sampai pemain mengganti ke alat/data asli.
- Tantangan: "turunkan tagihan kios 10% tanpa mengurangi jam buka" (batas jam buka mencegah solusi "matikan semuanya").

## 6. Misi — inti hubungan virtual ↔ nyata (K4, Kontrak C4)

| Misi | Aksi nyata | Data berlabel untuk AI | Hadiah | Fase |
|---|---|---|---|---|
| M1 Foto label alat | Foto label daya | Daya terpasang per alat | Alat "terverifikasi" | MVP |
| M2 Misi Meter | Foto meter buka & tutup | Konsumsi per jendela waktu | Energi + naik level | MVP |
| M3 Catatan jam pakai | Voice note: alat, jam, volume | Durasi per alat + satuan usaha | Poin + dekorasi | MVP |
| M4 Konfirmasi tebakan | "AI menebak pengering ±`[X]%`, benar?" | Label koreksi | Lencana "Detektif" | MVP |
| M5 Eksperimen kecil | Matikan 1 alat **non-kritis** saat istirahat, foto meter | Data kontras | Lencana + poin | Pilot |
| M6 Jalankan saran | Menjalankan saran yang disetujui | Data intervensi | Level naik bila hemat terbukti | Pilot |

**Keselamatan M5:** hanya alat non-kritis (`critical:false` di template), tidak menyentuh kabel/instalasi, tidak mengganggu layanan, teks panduan jelas. ⚠ Ditinjau mentor sebelum rilis.

### 6.1 Event misi (Kontrak C4)

```json
{
  "event_id": "uuid",
  "type": "mission_completed",
  "mission_id": "M2",
  "business_id": "b_123",
  "occurred_at": "2026-12-01T06:30:00+07:00",
  "payload": {"capture_id": "c_9", "meter_kwh": 12345.6, "window": "open"},
  "verification": {"status": "verified|pending|rejected", "reason": null, "confidence": "high"},
  "reward": {"points": 10, "badge": null}
}
```

Event disimpan oleh PRD 1 dan dikonsumsi oleh PRD 3 sebagai data berlabel. Hadiah dihitung **hanya** bila `verification.status = verified`.

### 6.2 Verifikasi dan anti-curang

| Risiko | Kontrol |
|---|---|
| Foto meter sama dipakai ulang | Hash foto + cek waktu EXIF/server; tolak duplikat |
| Angka meter turun atau melompat tak wajar | Cek kewajaran terhadap pembacaan sebelumnya; tandai "perlu konfirmasi" |
| Mengisi asal demi poin | Poin hanya dari data berkeyakinan ≥ Sedang; batas poin harian |
| Karyawan/pemilik mengisi asal | Konfirmasi tebakan (M4) dipakai juga sebagai uji konsistensi |
| Klik tanpa tindakan nyata | Level tidak naik dari klik; hanya dari misi terverifikasi |

## 7. Progres, level, hadiah

### 7.1 Level kios (usulan, ⚠ kalibrasi di pilot)

| Level | Syarat (terverifikasi) | Membuka |
|---|---|---|
| L1 Kios Baru | Pilih template | Simulasi dasar |
| L2 | ≥ 3 alat diganti dengan alat asli (M1) | Dekorasi dasar, tantangan mingguan |
| L3 | 3 hari Misi Meter (M2) + 3 catatan suara (M3) | Laporan Pertama lebih dini, maskot ganti gaya |
| L4 | Menyelesaikan 7 hari Misi Meter | Laporan Pertama penuh; ajakan trial |
| L5 | ≥ 1 saran dijalankan dan hemat terbukti (M6) | Lencana "Usaha Hemat", hadiah nyata |

### 7.2 Hadiah

- **Kosmetik:** dekorasi, tema, gaya maskot.
- **Nyata (agar tidak sekadar virtual):** kredit langganan, stiker/QR "Usaha Hemat Energi" untuk dipasang di kios, voucher mitra. ⚠ Butuh anggaran, mitra, dan aturan penebusan; biaya masuk unit economics. MVP awal: **kredit langganan + stiker QR**.
- Streak memakai **hari libur** agar usaha tutup tidak merasa dihukum.

### 7.3 Pengingat

Lewat WhatsApp/notifikasi dengan opsi mematikan; maksimal `[1]` pengingat misi/hari; waktu diatur pengguna.

## 8. AI assistant di dalam game: "Wati"

### 8.1 Peran

| Mode | Fungsi | Mesin |
|---|---|---|
| Pemandu | Menjelaskan kios, memberi petunjuk misi, bereaksi pada hasil | **Skrip + templat teks** (murah, aman) |
| Penjelas | "Kenapa pengering ini mahal?" memakai angka dari `energy-calc` | LLM **hanya menyusun kalimat**; angka dari C2 |
| Penanya | Mengajukan **satu** pertanyaan klarifikasi (M4) bila data ambigu | Aturan + LLM ringan |
| Jarvis/Tanya Wati | Tanya suara/teks atas data pengguna | PRD 3 `/ai/ask`; **terbuka untuk trial/Plus**, di free hanya data simulasi |

### 8.2 Batas

- Di tingkat **Gratis**, Wati menjawab hanya tentang simulasi dan cara bermain.
- Tidak mengarang angka; "belum cukup data" adalah jawaban sah.
- Tidak menyarankan hal berbahaya; tidak mendorong pengguna "mengakali" misi.
- Ekspresi maskot mengikuti status data (hemat/normal/lonjakan), bukan LLM.
- Setiap jawaban numerik memuat label **Simulasi** atau **Estimasi** + keyakinan.

## 9. Retensi dan "betah" (belum terjawab — diuji di pilot)

| Kandidat | Ukuran | Fase uji |
|---|---|---|
| Streak dengan hari libur | Retensi D7/D30 | Pilot |
| Tantangan bulanan (mis. Ramadan/hari raya) | Aktivasi musiman | Pilot |
| Liga komunitas sejenis usaha (anonim) | Retensi bulan ke-2/3 | Pilot |
| Hadiah nyata bertingkat | Konversi trial→Plus | Pilot |
| **Checklist tutup toko untuk karyawan** (H2) | Keterlibatan P2 | Pilot, bila wawancara mendukung |

Aturan: tidak ada klaim "membuat betah" di pitch sebelum ada data varian.

## 10. Gating: Gratis vs Trial vs Plus

| Fitur game | Gratis | Trial 30 hari | Plus | Locked (setelah trial) |
|---|---|---|---|---|
| Kios Virtual + simulasi | ✔ | ✔ | ✔ | ✔ |
| Misi M1 (foto label) | ✔ | ✔ | ✔ | ✔ |
| Misi M2–M6 menghasilkan analisis AI | ✖ (data disimpan; analisis menunggu trial) ⚠ | ✔ | ✔ | ✖ |
| Hadiah kosmetik | ✔ | ✔ | ✔ | ✔ (yang sudah dimiliki) |
| Hadiah nyata | ✖ | ✔ | ✔ | ✖ |
| Tanya Wati atas data asli | ✖ | ✔ | ✔ | ✖ |

⚠ Pilihan: apakah data M2–M3 sebelum trial **tetap disimpan** agar analisis langsung muncul saat trial dimulai? Usulan: ya, dengan persetujuan jelas.

## 11. Kebutuhan fungsional

| ID | Kebutuhan | P | Kriteria penerimaan |
|---|---|---|---|
| FR-G1 | Pilih template sub-bidang (3 + Kustom) | M | Kios terisi alat bawaan dari template versi tertentu |
| FR-G2 | Kios Virtual: alat, jam pakai, tagihan simulasi (Rp) | M | Geser jam mengubah angka seketika (≤ 100 ms); tanpa data pribadi |
| FR-G3 | Ganti alat bawaan dengan alat asli (foto/suara/manual) | M | Nama & daya terisi dan bisa dikoreksi; boleh dilewati |
| FR-G4 | Personalisasi kios (nama, tema, dekorasi, maskot, tata letak) | S | Tersimpan lintas perangkat setelah klaim akun |
| FR-G5 | Mesin misi M1–M4 (+M5–M6 pilot) | M | Event C4 terkirim; hadiah hanya saat terverifikasi |
| FR-G6 | Level kios sesuai §7.1 | S | Naik hanya dari misi terverifikasi |
| FR-G7 | Hadiah nyata | C | Tercatat & dapat ditebus; ⚠ anggaran |
| FR-G8 | Wati pemandu/penjelas | S | Angka hanya dari C2; label simulasi/estimasi |
| FR-G9 | Mode offline untuk simulasi | S | Berjalan tanpa jaringan; sinkron saat tersambung |
| FR-G10 | Analitik game | M | Event: `game_start`, `template_selected`, `appliance_replaced_real`, `mission_*`, `level_up`, `cta_trial_viewed` |
| FR-G11 | Aksesibilitas | M | Huruf besar, kontras tinggi, ikon + teks, tanpa suara wajib |

## 12. Kebutuhan non-fungsional

- Sesi ≤ 2 menit; muat game ≤ `[3]` dtk di 4G; ukuran aset awal ≤ `[5]` MB (lazy load).
- Grafis 2D ringan (SVG/sprite/Canvas, mis. Phaser atau engine setara) agar jalan di ponsel Android menengah-bawah; target `[30]` fps.
- Bahasa sehari-hari, tanpa istilah teknis ("kWh" tersembunyi di balik "Rp" dan "per kg/porsi").
- Aman untuk semua usia dewasa; tanpa konten judi/gacha berbayar.

## 13. Metrik

| Metrik | Target |
|---|---|
| Penyelesaian tutorial ≤ 90 dtk | `[X]%` |
| Pemain yang mengganti ≥ 1 alat asli | `[X]%` |
| Pemain yang menyelesaikan Misi Meter hari 7 | `[X]%` |
| Pemain → mulai trial | `[X]%` |
| Retensi D7 / D30 | `[X]` / `[X]` |
| Hasil verifikasi misi "terverifikasi" | ≥ `[X]%` |

## 14. Risiko

| Risiko | Mitigasi |
|---|---|
| Gimmick; pemilik tidak peduli | Hadiah nyata; durasi ≤ 2 menit; ukur di pilot |
| Poin virtual cepat membosankan | Level terhubung hasil nyata |
| Template salah (daya/pola) | Verifikasi ke pelaku usaha; versi template; prior dikoreksi oleh data |
| Rumus game ≠ rumus laporan | Kontrak C2 (satu pustaka) |
| Mengisi asal demi poin | §6.2 |
| Biaya hadiah nyata | Mulai dari kredit + stiker; batas per pengguna |

## 15. Pertanyaan terbuka

1. Tiga template MVP dan verifikator katalog.
2. Referensi "Pak Pras": fitur village builder spesifik apa yang ingin ditiru?
3. Engine game: Phaser/Canvas/SVG + framework FE (bergantung keputusan PRD 1 §4).
4. Apakah M2–M3 sebelum trial disimpan (§10)?
5. Sumber anggaran/mitra hadiah nyata.
6. Ambang level L2–L5 (kalibrasi di pilot).
