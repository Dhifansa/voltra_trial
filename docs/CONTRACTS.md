# Kontrak Integrasi C1–C6

Kontrak adalah kesepakatan antar-modul, bukan detail implementasi. FE, BE, game, dan AI boleh bekerja paralel hanya jika kontrak dan fixture mock tersedia.

**Status dokumen:** Release candidate **v0.1.0** (2026-11-06). Menunggu persetujuan empat pemilik area di issue #4; setelah disetujui statusnya menjadi **Frozen**.

**Versi kode:** `packages/contracts/src/common.ts` mengekspor `CONTRACT_VERSION = "0.1.0"`.

## Ringkasan kontrak

| ID | Kontrak | Pemilik | Consumer | Bentuk | Status |
|---|---|---|---|---|---|
| **C1** | Template Schema | Dhifansa | FE, BE, AI | JSON berversi | RC v0.1.0 |
| **C2** | `energy-calc` | Mahdi | Game, BE, laporan, Wati | Paket TypeScript | RC v0.1.0 |
| **C3** | AI Gateway API | Mahdi (host), Muchsin (adapter) | FE, game | OpenAPI 3.1 | RC v0.1.0 |
| **C4** | Mission Event | Dhifansa (producer), Mahdi (storage) | BE, AI | JSON event | RC v0.1.0 |
| **C5** | Entitlement | Mahdi | Game, AI | JSON + cek server | RC v0.1.0 |
| **C6** | Tingkat keyakinan | Mahdi/Muchsin | FE, game, laporan | Enum + ambang konfigurasi | RC v0.1.0 |

## Artefak

| Kontrak | Skema/tipe | Contoh/fixture |
|---|---|---|
| C1 | [`schemas/c1-template.schema.json`](../packages/contracts/schemas/c1-template.schema.json) | [`fixtures/templates/laundry.json`](../packages/contracts/fixtures/templates/laundry.json) |
| C2 | [`schemas/c2-estimate.schema.json`](../packages/contracts/schemas/c2-estimate.schema.json) | [`fixtures/estimates/estimate-low-confidence.json`](../packages/contracts/fixtures/estimates/estimate-low-confidence.json) |
| C3 | [`openapi.yaml`](../packages/contracts/openapi.yaml) | [`fixtures/ai/`](../packages/contracts/fixtures/ai) |
| C4 | [`schemas/c4-mission-event.schema.json`](../packages/contracts/schemas/c4-mission-event.schema.json) | [`fixtures/missions/mission-completed.json`](../packages/contracts/fixtures/missions/mission-completed.json) |
| C5 | [`schemas/c5-entitlement.schema.json`](../packages/contracts/schemas/c5-entitlement.schema.json) | [`fixtures/entitlements/trial-entitlement.json`](../packages/contracts/fixtures/entitlements/trial-entitlement.json) |
| C6 | [`schemas/c6-confidence.schema.json`](../packages/contracts/schemas/c6-confidence.schema.json) | [`fixtures/confidence/low-confidence.json`](../packages/contracts/fixtures/confidence/low-confidence.json) |

Tipe TypeScript untuk semua kontrak ada di [`packages/contracts/src/`](../packages/contracts/src).

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
        "hours_per_day": { "min": 2, "typical": 5, "max": 10 },
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
- `missions_enabled` hanya berisi `M1`–`M6`.

## C2 — `energy-calc`

Tipe referensi ada di [`src/energy.ts`](../packages/contracts/src/energy.ts). Bentuk JSON memakai `snake_case` agar sama dengan C3.

```ts
interface ApplianceInput {
  appliance_id: string;
  power_kw: number;
  hours: number;
  load_factor: number;
}

interface EstimateInput {
  window: { from: string; to: string };
  appliances: ApplianceInput[];
  meter_delta_kwh?: number;
  engine_version: string;
}

interface EstimateResult {
  window: { from: string; to: string };
  meter_delta_kwh: number | null;
  per_appliance: Array<{
    appliance_id: string;
    kwh: number;
    basis: { power_kw: number; hours: number; load_factor: number };
    confidence: "high" | "medium" | "low";
  }>;
  explained_kwh: number;
  unexplained_kwh: number | null;
  gap_ratio: number | null;
  overall_confidence: "high" | "medium" | "low";
  display_level: "appliance" | "category" | "insufficient_data";
  next_questions?: string[];
  suggested_missions?: string[];
  engine_version: string;
}
```

Fungsi yang dicakup: kWh per alat, Rupiah, faktor beban, estimasi, cross-validation, verifikasi dampak, ROI. Ambang keyakinan (15%/35%) dan parameter lain adalah konfigurasi, bukan angka yang ditulis tersebar di kode.

Aturan:

- Perhitungan murni: tidak mengakses database, jaringan, atau jam sistem secara implisit.
- Waktu, tarif, dan data alat selalu menjadi input.
- `unexplained_kwh` tidak dibagi paksa ke alat lain.
- `display_level = "insufficient_data"` bila data kurang dari 3 hari.
- Perubahan rumus wajib melalui golden test dan review.

## C3 — AI Gateway API

### Katalog endpoint

| Method | Path | Pipeline | Input | Output utama | Fixture |
|---|---|---|---|---|---|
| POST | `/ai/ocr-meter` | P1 | Foto + tipe meter | `kwh`, `confidence`, `bbox`, `needs_retake` | `ocr-meter.success.json`, `ocr-meter.low-confidence.json` |
| POST | `/ai/ocr-label` | P2 | Foto label alat | `name`, `power_w`, `confidence` | — |
| POST | `/ai/ocr-token` | P3 | Foto struk/layar token | `date`, `amount_rp`, `kwh`, `remaining_kwh`, `confidence` | — |
| POST | `/ai/stt-extract` | P4 | Audio + daftar alat | `transcript`, `entries[]`, `confidence`, `confirm_text` | — |
| POST | `/ai/estimate` | P5/P6 | Kios + jendela waktu | Estimasi per alat/kategori, `unexplained_kwh`, keyakinan | `estimate.insufficient-data.json` |
| POST | `/ai/recommend` | P7 | Estimasi + konteks kios | Maks. 3 saran, rentang hemat, keyakinan | — |
| POST | `/ai/explain` | P8 | Objek hasil | Teks tanpa angka baru | — |
| POST | `/ai/ask` | P10 | Pertanyaan Wati | Jawaban, `sources`, keyakinan | — |

P9 (verifikasi dampak) adalah perhitungan internal `energy-calc`, bukan endpoint publik. Bentuk hasilnya ada di komponen `ImpactVerificationResult` pada OpenAPI. P11–P13 belum ditetapkan sebagai endpoint publik (O32).

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

Field pipeline ditambahkan di level yang sama. Jangan mengubah bentuk ini tanpa versi kontrak.

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

Kode yang disepakati: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `LOW_CONFIDENCE`, `PROVIDER_ERROR`, `RATE_LIMITED`, `INSUFFICIENT_DATA`.

Fixture error wajib tersedia untuk `insufficient_data` dan `provider_error`.

### Aturan mode

- `mock`: fixture tetap, label **Contoh**, tidak boleh menghasilkan penghematan pasti.
- `hybrid`: sebagian endpoint live; status per endpoint.
- `live`: pipeline sebenarnya.
- Mock tidak boleh dipakai di pilot/produksi; CI memeriksa flag.
- Setiap respons mock menyertakan `mode: "mock"`, dan UI menampilkan label **Contoh**.

### Fixture AI

`packages/contracts/fixtures/ai/` berisi:

- `ocr-meter.success.json` — respons sukses.
- `ocr-meter.low-confidence.json` — keyakinan rendah, `needs_retake: true`.
- `estimate.insufficient-data.json` — error `INSUFFICIENT_DATA`.
- `ocr-meter.provider-error.json` — error `PROVIDER_ERROR`.

## C4 — Mission Event

```json
{
  "event_id": "9f1c2f4a-6a1e-4f4f-9a2e-2f6b7c8d9e10",
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
- `mission_id` mengikuti pola `M1`–`M6`.

## C5 — Entitlement

Status: `free | trial | plus | locked`.

| Status | Kios/simulasi | M1 | M2–M6/AI | Tanya Wati data asli | Hadiah kosmetik |
|---|---|---|---|---|---|
| `free` | Ya | Ya | Tidak; data dapat disimpan dengan persetujuan | Tidak | Ya |
| `trial` | Ya | Ya | Ya | Ya | Ya |
| `plus` | Ya | Ya | Ya | Ya | Ya |
| `locked` | Ya | Ya | Tidak | Tidak | Ya (yang dimiliki tetap ada) |

Bentuk data:

```json
{
  "business_id": "b_123",
  "status": "trial",
  "trial_started_at": "2026-12-01T06:30:00+07:00",
  "trial_ends_at": "2026-12-31T06:30:00+07:00",
  "features": {
    "kios": true,
    "m1": true,
    "ai_analysis": true,
    "wati_real_data": true,
    "cosmetic_rewards": true
  },
  "updated_at": "2026-12-01T06:30:00+07:00"
}
```

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

Ambang disimpan sebagai konfigurasi di [`src/confidence.ts`](../packages/contracts/src/confidence.ts):

```ts
export const CONFIDENCE_THRESHOLDS = {
  high_max_gap: 0.15,
  medium_max_gap: 0.35,
  min_data_days: 3,
} as const;
```

Mapping skor rekomendasi: Tinggi 1.0, Sedang 0.6, Rendah 0.3 (provisional). Ambang harus dikalibrasi dengan data pilot.

Tampilan:

- Tinggi/Sedang: estimasi per alat + label **Estimasi**.
- Rendah: kategori (pemanas/pendingin/lain-lain).
- Data tidak cukup: **Belum cukup data** + misi/pertanyaan lanjutan.

## Versioning dan perubahan

- `CONTRACT_VERSION` saat ini `0.1.0`; template memiliki versi sendiri.
- Perubahan aditif (field opsional, endpoint baru) = minor.
- Perubahan yang memutus consumer = major + masa migrasi.
- Perubahan C1–C6 harus melalui issue `contract-change`, PR terpisah, dan persetujuan empat pemilik area.
- Contract test C1–C6 berjalan di CI; fixture mock menjadi fixture test.
- Data historis tidak boleh rusak oleh perubahan skema.

## Validasi

```bash
pnpm test:contract   # validasi JSON Schema + fixture + OpenAPI + external refs
pnpm typecheck       # tipe C1-C6 dan test
pnpm lint
pnpm build
```

Contract test memakai Ajv 2020 dan SwaggerParser. Kegagalan schema atau OpenAPI memblokir CI.

## Lokasi artefak

```text
packages/contracts/
  openapi.yaml                  # C3
  schemas/
    c1-template.schema.json     # C1
    c2-estimate.schema.json     # C2
    c3-ai-envelope.schema.json  # C3
    c3-error.schema.json        # C3
    c4-mission-event.schema.json # C4
    c5-entitlement.schema.json  # C5
    c6-confidence.schema.json   # C6
  fixtures/
    ai/                         # mock sukses/low-confidence/gagal
    templates/                  # C1
    estimates/                  # C2
    missions/                   # C4
    entitlements/               # C5
    confidence/                 # C6
  src/                          # tipe TypeScript C1-C6
tests/contract/                 # contract test C1-C6
```
