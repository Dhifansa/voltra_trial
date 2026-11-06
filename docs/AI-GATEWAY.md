# AI Gateway (mock)

AI Gateway memisahkan FE dari penyedia AI. Pada S1 hanya adapter **mock** yang tersedia; adapter live/hybrid dikerjakan Muchsin setelah #8 dan keputusan O15.

Kontrak: [`packages/contracts/openapi.yaml`](../packages/contracts/openapi.yaml) · Tipe: [`packages/contracts/src/ai.ts`](../packages/contracts/src/ai.ts).

## Mode

| Mode | Perilaku | Penggunaan |
|---|---|---|
| `mock` | Fixture tetap, `mode: "mock"` di envelope | Pengembangan FE/BE dan demo awal |
| `hybrid` | Sebagian endpoint live | Transisi |
| `live` | Pipeline sebenarnya | Pilot dan produksi |

`AI_MODE` dibaca saat API start. **Mock ditolak** bila `APP_ENV` atau `NODE_ENV` bernilai `pilot`/`production`; API gagal start dengan pesan yang jelas. Pemeriksaan ini juga diuji di `apps/api/src/ai/ai-config.test.ts`, sehingga CI gagal bila aturan itu rusak.

UI **wajib** menampilkan label **Contoh** saat menerima `mode: "mock"` dan menampilkan state gagal untuk `PROVIDER_ERROR`, `INSUFFICIENT_DATA`, dan `LOW_CONFIDENCE`. Mock tidak boleh dipakai sebagai bukti penghematan pada demo ke pengguna.

## Skenario

Semua endpoint mendukung empat skenario:

| Skenario | Hasil |
|---|---|
| `success` | Respons normal |
| `low_confidence` | Keyakinan rendah; OCR/label meminta foto ulang; estimasi turun ke kategori; Wati tanpa sumber |
| `insufficient_data` | HTTP 422, `INSUFFICIENT_DATA` |
| `provider_error` | HTTP 502, `PROVIDER_ERROR` |

Urutan pemilihan skenario:

1. Header `x-ai-scenario` (hanya diizinkan saat mode mock dan lingkungan dev/test).
2. `AI_SCENARIO` dari environment.
3. `success`.

```bash
curl -X POST http://localhost:3001/ai/ocr-meter \
  -H "x-ai-scenario: low_confidence" \
  -F "file=@meter.jpg" \
  -F "meter_type=prabayar"
```

## Endpoint

| Method | Path | Pipeline | Body |
|---|---|---|---|
| POST | `/ai/ocr-meter` | P1 | multipart: `file`, `meter_type` |
| POST | `/ai/ocr-label` | P2 | multipart: `file`, `appliance_hint?` |
| POST | `/ai/ocr-token` | P3 | multipart: `file` |
| POST | `/ai/stt-extract` | P4 | JSON: `audio_ref`, `appliances[]` |
| POST | `/ai/estimate` | P5/P6 | JSON: `business_id`, `window`, `appliances[]`, `meter_delta_kwh?` |
| POST | `/ai/recommend` | P7 | JSON: `business_id`, `estimate`, `template_id`, `unit_label` |
| POST | `/ai/explain` | P8 | JSON: `business_id`, `kind`, `result` |
| POST | `/ai/ask` | P10 | JSON: `business_id`, `question`, `conversation_id?` |

Mock tidak membaca isi file; unggahan hanya untuk memastikan FE mengirim bentuk request yang benar. Estimasi memakai angka contoh PRD 8.9 dan tidak menghitung dari input sampai #21 selesai.

## Contoh

### Sukses OCR meter

```bash
curl -X POST http://localhost:3001/ai/ocr-meter -F "file=@meter.jpg" -F "meter_type=prabayar"
```

```json
{
  "request_id": "r_...",
  "engine_version": "mock-ocr-meter-0.1.0",
  "mode": "mock",
  "confidence": "high",
  "warnings": [],
  "kwh": 12345.6,
  "unit": "kWh",
  "digits_confidence": [0.99, 0.97, 0.98, 0.95, 0.9, 0.88],
  "needs_retake": false,
  "bbox": [120, 240, 480, 360]
}
```

### Estimasi sukses

```bash
curl -X POST http://localhost:3001/ai/estimate \
  -H "content-type: application/json" \
  -d '{"business_id":"b_123","window":{"from":"2026-12-01T06:00:00+07:00","to":"2026-12-02T06:00:00+07:00"},"appliances":[{"appliance_id":"dryer","power_kw":3,"hours":5,"load_factor":0.7}],"meter_delta_kwh":12}'
```

### Estimasi keyakinan rendah

```bash
curl -X POST http://localhost:3001/ai/estimate \
  -H "content-type: application/json" \
  -H "x-ai-scenario: low_confidence" \
  -d '{"business_id":"b_123","window":{"from":"2026-12-01T06:00:00+07:00","to":"2026-12-02T06:00:00+07:00"},"appliances":[]}'
```

Respons memakai `overall_confidence: "low"`, `display_level: "category"`, `unexplained_kwh: 17.5`, dan `suggested_missions`.

### Gagal

```bash
curl -i -X POST http://localhost:3001/ai/ocr-meter -H "x-ai-scenario: provider_error" -F "file=@meter.jpg"
```

```json
{
  "error": {
    "code": "PROVIDER_ERROR",
    "message": "Penyedia AI sedang tidak tersedia. Coba lagi atau masukkan data manual.",
    "request_id": "r_...",
    "details": { "pipeline": "ocr-meter", "provider": "mock", "retryable": true }
  }
}
```

`request_id` juga dikembalikan di header `x-request-id`; FE dapat menampilkannya pada state gagal.

## Rekomendasi dan angka

- Semua penghematan memakai rentang `min`/`max`; tidak ada angka penghematan pasti.
- Teks P8 tidak memuat angka baru (`numbers_used: []` pada mock).
- P10 dengan keyakinan rendah tidak mengembalikan sumber dan menyarankan misi data.
- Semua angka kWh/Rp produksi nanti berasal dari `@voltra/energy-calc` (ADR-003).

## Verifikasi

```bash
pnpm test            # unit + contract test
pnpm test:contract   # skema C3/C2 dan fixture
pnpm build
```

Contract test mock ada di [`tests/contract/ai-mock.test.ts`](../tests/contract/ai-mock.test.ts).

## Demo FE

`apps/web/src/app/ai-mock-demo.tsx` memanggil `/ai/ask` dan menampilkan:

- label **Contoh** saat `mode: "mock"`;
- keyakinan dan `request_id`;
- state gagal dengan kode error, pesan, dan tombol coba lagi.

Demo ini adalah referensi minimal untuk Dhifansa; komponen produksi tetap mengikuti desain Kios Virtual.
