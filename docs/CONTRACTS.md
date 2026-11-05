# Kontrak Integrasi C1–C6

Kontrak adalah kesepakatan antar-modul, bukan detail implementasi. FE, BE, game, dan AI boleh bekerja paralel hanya jika kontrak dan fixture mock tersedia.

**Status dokumen:** Draft v0 — dibekukan pada Sprint S1 setelah review empat pemilik area.

## Ringkasan kontrak

| ID | Kontrak | Pemilik | Consumer | Bentuk | Status |
|---|---|---|---|---|---|
| **C1** | Template Schema | Dhifansa | FE, BE, AI | JSON berversi | Draft v0 |
| **C2** | `energy-calc` | Mahdi | Game, BE, laporan, Wati | Paket kode/layanan | Draft v0 |
| **C3** | AI Gateway API | Mahdi (host), Muchsin (adapter) | FE, game | OpenAPI; mode mock/hybrid/live | Draft v0 |
| **C4** | Mission Event | Dhifansa (producer), Mahdi (storage) | BE, AI | JSON event | Draft v0 |
| **C5** | Entitlement | Mahdi | Game, AI | Token auth + cek server | Draft v0 |
| **C6** | Tingkat keyakinan | Mahdi/Muchsin | FE, game, laporan | Enum + ambang konfigurasi | Draft v0 |

### Aturan emas C2

> Game tidak boleh memiliki rumus hitung sendiri. Angka kWh/Rp yang muncul di simulasi, estimasi, rekomendasi, laporan, dan Tanya Wati harus bersumber dari pustaka yang sama.

Konsekuensi:

- FE tidak menghitung ulang kWh/Rp; FE memanggil `energy-calc`/API atau menampilkan hasil yang sudah dihitung.
- Perubahan rumus hanya di `packages/energy-calc`.
- Setiap keluaran menyertakan `engine_version`.

## C1 — Template Schema

Contoh struktur (bukan spesifikasi universal semua alat):

```json
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
      "power_w": { "min": 2000, "typical": 3000, "max": 4500 },
      "load_factor": { "typical": 0.7, "range": [0.5, 0.9] },
      "usage_pattern": {
        "hours_per_day": { "typical": 5, "range": [2, 10] },
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

Aturan:

- Kios menyimpan `template_id@versi`; pembaruan template tidak mengubah kios aktif tanpa persetujuan.
- Nilai `power_w`, `load_factor`, dan `usage_pattern` adalah prior, bukan kebenaran.
- Data alat asli (foto label/input manual) menggantikan nilai template.
- Katalog MVP: Laundry, Rumah makan/warung, Toko roti/katering, Kustom.

## C2 — `energy-calc`

Antarmuka minimum yang perlu disepakati:

```ts
type Confidence = "high" | "medium" | "low";

interface ApplianceInput {
  applianceId: string;
  powerKw: number;
  hours: number;
  loadFactor: number;
}

interface EstimateInput {
  window: { from: string; to: string };
  appliances: ApplianceInput[];
  meterDeltaKwh?: number;
  engineVersion: string;
}

interface EstimateResult {
  perAppliance: Array<{
    applianceId: string;
    kwh: number;
    basis: { powerKw: number; hours: number; loadFactor: number };
    confidence: Confidence;
  }>;
  explainedKwh: number;
  unexplainedKwh: number | null;
  gapRatio: number | null;
  overallConfidence: Confidence;
  displayLevel: "appliance" | "category" | "insufficient_data";
}
```

Fungsi yang dicakup: kWh per alat, Rupiah, faktor beban, estimasi, cross-validation, verifikasi dampak, ROI. Ambang keyakinan (15%/35%) dan parameter lain adalah konfigurasi, bukan angka yang ditulis tersebar di kode.

## C3 — AI Gateway API

### Katalog endpoint

| Method | Path | Pipeline | Input | Output utama |
|---|---|---|---|---|
| POST | `/ai/ocr-meter` | P1 | Foto + tipe meter | `kwh`, `confidence`, `bbox`, `needs_retake` |
| POST | `/ai/ocr-label` | P2 | Foto label alat | `name`, `power_w`, `confidence` |
| POST | `/ai/ocr-token` | P3 | Foto struk/layar token | `date`, `amount_rp`, `kwh`, `remaining_kwh`, `confidence` |
| POST | `/ai/stt-extract` | P4 | Audio + daftar alat | `transcript`, `entries[]`, `confidence`, `confirm_text` |
| POST | `/ai/estimate` | P5/P6 | Kios + jendela waktu | Estimasi per alat/kategori, `unexplained_kwh`, keyakinan |
| POST | `/ai/recommend` | P7 | Estimasi + konteks kios | Maks. 3 saran, rentang hemat, keyakinan |
| POST | `/ai/explain` | P8 | Objek hasil | Teks tanpa angka baru |
| POST | `/ai/ask` | P10 | Pertanyaan Wati | Jawaban, `sources`, keyakinan |

P11–P13 belum ditetapkan sebagai endpoint publik (O32).

### Envelope respons

Setiap respons AI memuat:

```json
{
  "request_id": "r_001",
  "engine_version": "ocr-meter-0.1",
  "mode": "mock",
  "confidence": "medium",
  "warnings": []
}
```

Field pipeline ditambahkan di level yang sama atau di dalam `data`, sesuai keputusan OpenAPI final. Jangan mengubah bentuk ini tanpa versi kontrak.

### Error

Gunakan satu bentuk error untuk semua endpoint:

```json
{
  "error": {
    "code": "LOW_CONFIDENCE",
    "message": "Foto kurang jelas. Ambil ulang atau masukkan angka manual.",
    "request_id": "r_001",
    "details": { "needs_retake": true }
  }
}
```

Kode yang disarankan: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `LOW_CONFIDENCE`, `PROVIDER_ERROR`, `RATE_LIMITED`, `INSUFFICIENT_DATA`.

### Aturan mode

- `mock`: fixture tetap, label **Contoh**, tidak boleh menghasilkan penghematan pasti.
- `hybrid`: sebagian endpoint live; status per endpoint.
- `live`: pipeline sebenarnya.
- Mock tidak boleh dipakai di pilot/produksi; CI memeriksa flag.
- Setiap respons mock menyertakan `mode: "mock"`, dan UI menampilkan label **Contoh**.

## C4 — Mission Event

```json
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
    "status": "verified",
    "reason": null,
    "confidence": "high"
  },
  "reward": {
    "points": 10,
    "badge": null
  }
}
```

Aturan:

- Event disimpan oleh aplikasi sistem; AI mengonsumsinya sebagai data berlabel.
- Hadiah hanya diberikan bila `verification.status = "verified"`.
- `status`: `verified | pending | rejected`.
- Hash foto, waktu, dan kewajaran angka meter diperiksa untuk anti-curang.
- Poin hanya untuk data dengan keyakinan minimal Sedang; ada batas poin harian.

## C5 — Entitlement

Status: `free | trial | plus | locked`.

| Status | Kios/simulasi | M1 | M2–M6/AI | Tanya Wati data asli | Hadiah kosmetik |
|---|---|---|---|---|---|
| `free` | Ya | Ya | Tidak; data dapat disimpan dengan persetujuan | Tidak | Ya |
| `trial` | Ya | Ya | Ya | Ya | Ya |
| `plus` | Ya | Ya | Ya | Ya | Ya |
| `locked` | Ya | Ya | Tidak | Tidak | Ya (yang dimiliki tetap ada) |

Aturan:

- Entitlement diperiksa di server pada setiap panggilan AI, bukan hanya di FE.
- Trial dimulai saat data asli pertama terhubung, bukan saat game pertama dibuka.
- Perubahan status dicatat dan dapat diaudit.
- Game tetap gratis setelah trial; analisis AI terkunci.

## C6 — Tingkat keyakinan

Enum: `high | medium | low`.

| Kondisi awal (provisional) | Keyakinan |
|---|---|
| `|gap| ≤ 15%` dari meter dan data jam lengkap | Tinggi |
| `15% < |gap| ≤ 35%` atau sebagian data jam hilang | Sedang |
| `|gap| > 35%` atau data < 3 hari | Rendah |

Ambang adalah titik awal dan harus dikalibrasi dengan data pilot. Mapping skor rekomendasi: Tinggi 1.0, Sedang 0.6, Rendah 0.3 (provisional).

Tampilan:

- Tinggi/Sedang: estimasi per alat + label **Estimasi**.
- Rendah: kategori (pemanas/pendingin/lain-lain).
- Data tidak cukup: **Belum cukup data** + misi/pertanyaan lanjutan.

## Versioning dan perubahan

- Kontrak dan template memiliki versi; kios terikat pada versi yang digunakan.
- Perubahan aditif (field opsional, endpoint baru) = minor.
- Perubahan yang memutus consumer = major + masa migrasi.
- Perubahan C1–C6 harus melalui issue `contract-change`, PR terpisah, dan persetujuan empat pemilik area.
- Contract test C1–C6 berjalan di CI; fixture mock menjadi fixture test.
- Data historis tidak boleh rusak oleh perubahan skema.

## Lokasi artefak (target S1)

```text
packages/contracts/
  openapi.yaml          # C3
  templates/*.json      # C1
  mission-event.schema.json  # C4
  entitlement.ts        # C5
  confidence.ts         # C6
packages/energy-calc/   # C2
tests/contract/         # contract test
fixtures/ai/            # fixture mock sukses/low-confidence/gagal
```
