# energy-calc

`@voltra/energy-calc` adalah satu-satunya tempat rumus kWh dan Rupiah (ADR-003, aturan emas C2). FE, API, laporan, game, dan Wati wajib memakai paket ini; tidak boleh ada rumus duplikat di modul lain.

**Versi mesin:** `0.1.0` (`ENGINE_VERSION`). Setiap hasil C2 membawa nilai ini.

## Rumus

```text
kWh = daya(kW) x jam x faktor_beban
Rp  = kWh x tarif(Rp/kWh)
```

Tarif **selalu input** dari profil usaha/golongan tarif. Tidak ada tarif default di kode; nilai tarif harus diverifikasi dari sumber resmi (PRD 8.5).

## API paket

```ts
import {
  ENGINE_VERSION,
  ENERGY_CALC_CONFIG,
  calculateApplianceKwh,
  calculateCostRp,
  calculateApplianceCostRp,
  roundKwh,
  roundRp,
  assessConfidence,
  estimate,
} from '@voltra/energy-calc';
```

| Fungsi | Kegunaan |
|---|---|
| `calculateApplianceKwh(powerKw, hours, loadFactor)` | kWh satu alat; menolak nilai negatif dan `load_factor > 1` |
| `calculateCostRp(kwh, tariff)` | Rupiah dari kWh dan tarif input |
| `calculateApplianceCostRp(appliance, tariff)` | kWh + Rupiah satu alat |
| `roundKwh` / `roundRp` | Pembulatan sesuai konfigurasi (2 desimal kWh, 0 desimal Rp) |
| `assessConfidence(gapRatio, dataDays, negativeGap?)` | Level C6 dan `display_level` |
| `estimate(input)` | Hasil C2 lengkap: per alat, total, gap, keyakinan |

`ENERGY_CALC_CONFIG` mengambil ambang dari C6 (`CONFIDENCE_THRESHOLDS`) agar tidak ada dua sumber angka:

```ts
{
  highMaxGap: 0.15,
  mediumMaxGap: 0.35,
  minDataDays: 3,
  kwhDecimals: 2,
  rpDecimals: 0,
}
```

## Keyakinan dan gap

| Kondisi | Keyakinan | Tampilan |
|---|---|---|
| `|gap| <= 15%` dan data >= 3 hari | `high` | per alat |
| `15% < |gap| <= 35%` | `medium` | per alat |
| `|gap| > 35%` atau gap negatif | `low` | kategori |
| data < 3 hari | `low` | `insufficient_data` |
| tanpa delta meter | `medium` | per alat |

Aturan penting:

- Gap **tidak** dibagi ke alat lain. Sisa tampil sebagai `unexplained_kwh`.
- Gap negatif (estimasi melebihi meter) berarti jam/faktor beban mungkin terlalu tinggi; keyakinan turun, bukan angkanya dipaksa cocok.
- `data_days` opsional pada input C2; bila tidak diisi, mesin menganggap syarat minimum terpenuhi. API dapat mengirim `data_days` dari data capture.
- `engine_version` pada input diabaikan; hasil selalu memakai `ENGINE_VERSION`.

## Golden test PRD 8.9

| Kasus | Hasil |
|---|---|
| Pengering 3 kW x 5 jam x 0,7 | 10,5 kWh |
| Meter naik 28 kWh | belum terjelaskan 17,5 kWh; gap 62,5%; keyakinan rendah; tampilan kategori |
| Tambah kulkas 0,15 kW x 24 x 0,4 | 1,44 kWh |
| Tambah setrika 1 kW x 2 x 0,8 | 1,6 kWh |
| Total setelah konfirmasi | 13,54 kWh; belum terjelaskan ~14,5 kWh |

Biaya contoh: `10,5 kWh x Rp1.444,7 = Rp15.169` (dibulatkan 0 desimal). Tarif ini hanya contoh test; bukan default aplikasi.

Golden test ada di [`packages/energy-calc/src/index.test.ts`](../packages/energy-calc/src/index.test.ts) dan berjalan di CI lewat `pnpm test`.

## Batas paket

- Bebas dependensi Node.js; bisa dipakai browser dan server.
- Tidak mengakses database, jaringan, atau jam sistem secara implisit.
- Tidak menyimpan state; semua input eksplisit.
- Perubahan rumus wajib menaikkan `ENGINE_VERSION`, memperbarui golden test, dan lewat review.

## Status integrasi

- Paket sudah dipakai API untuk `/health` (`engineVersion`).
- Endpoint `/ai/estimate` masih mengembalikan fixture mock #8. Penggantian ke `estimate()` dilakukan saat integrasi estimasi/report (#14/#15), bukan dengan rumus baru di controller.
