/**
 * DATA CONTOH (mock) untuk pengembangan UI.
 *
 * - Bentuk data mengikuti kontrak C1–C6 (`@voltra/contracts`).
 * - Semua kWh/Rp dihitung oleh `@voltra/energy-calc` — FE tidak punya rumus sendiri.
 * - Nanti modul ini diganti respons API (`/ai/estimate`, `/ai/recommend`, dst.)
 *   tanpa mengubah komponen UI.
 */
import type {
  ApplianceCategory,
  Confidence,
  DisplayLevel,
  EstimateResult,
  OcrLabelResponse,
  OcrMeterResponse,
  ApiErrorBody,
  Recommendation,
  SttExtractResponse,
} from '@voltra/contracts';
import { calculateCostRp, estimate } from '@voltra/energy-calc';

export const MOCK_BUSINESS = {
  name: 'Laundry Bu Sari',
  template: 'Laundry Kiloan',
  unit_label: 'kg cucian',
  daily_volume: 50,
  tariff_name: 'B-1/TR 2200 VA',
  /** Tarif contoh dari konfigurasi BE (electricity-rates.config.ts). */
  tariff_rp_per_kwh: 1444.7,
  data_days: 5,
  trial_days_left: 23,
};

export interface MockAppliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  power_kw: number;
  hours: number;
  load_factor: number;
}

export const MOCK_APPLIANCES: MockAppliance[] = [
  { id: 'dryer', name: 'Pengering', category: 'heater', power_kw: 3, hours: 5, load_factor: 0.7 },
  { id: 'washer', name: 'Mesin cuci', category: 'other', power_kw: 0.5, hours: 6, load_factor: 0.8 },
  { id: 'iron', name: 'Setrika uap', category: 'heater', power_kw: 1, hours: 4, load_factor: 0.5 },
  { id: 'lamp', name: 'Lampu kios', category: 'lighting', power_kw: 0.15, hours: 12, load_factor: 1 },
  { id: 'pump', name: 'Pompa air', category: 'other', power_kw: 0.25, hours: 3, load_factor: 0.8 },
];

export const CATEGORY_LABEL: Record<ApplianceCategory, string> = {
  heater: 'Pemanas & pengering',
  cooling: 'Pendingin',
  lighting: 'Penerangan',
  other: 'Motor & lainnya',
};

const WINDOW = { from: '2026-11-05T06:00:00+07:00', to: '2026-11-06T06:00:00+07:00' };

function runEstimate(meterDelta: number, dataDays: number): EstimateResult {
  return estimate({
    window: WINDOW,
    appliances: MOCK_APPLIANCES.map(({ id, power_kw, hours, load_factor }) => ({
      appliance_id: id,
      power_kw,
      hours,
      load_factor,
    })),
    meter_delta_kwh: meterDelta,
    data_days: dataDays,
    engine_version: '0.1.0',
  });
}

export type ScenarioId = 'appliance' | 'category' | 'insufficient';

export interface CostRow {
  id: string;
  label: string;
  kwh: number;
  rp: number;
  share: number;
  basis?: string;
}

export interface CostScenario {
  id: ScenarioId;
  label: string;
  hint: string;
  result: EstimateResult;
  display_level: DisplayLevel;
  confidence: Confidence;
  total_rp: number | null;
  unexplained_rp: number | null;
  per_unit_rp: number | null;
  rows: CostRow[];
}

function rp(kwh: number): number {
  return calculateCostRp(kwh, MOCK_BUSINESS.tariff_rp_per_kwh);
}

function buildScenario(id: ScenarioId, label: string, hint: string, meter: number, days: number): CostScenario {
  const result = runEstimate(meter, days);
  const meterKwh = result.meter_delta_kwh ?? result.explained_kwh;
  const share = (kwh: number) => (meterKwh > 0 ? kwh / meterKwh : 0);
  const nameOf = (applianceId: string) =>
    MOCK_APPLIANCES.find((a) => a.id === applianceId)?.name ?? applianceId;

  let rows: CostRow[] = [];
  if (result.display_level === 'appliance') {
    rows = result.per_appliance
      .map((a) => ({
        id: a.appliance_id,
        label: nameOf(a.appliance_id),
        kwh: a.kwh,
        rp: rp(a.kwh),
        share: share(a.kwh),
        basis: `${a.basis.power_kw} kW × ${a.basis.hours} jam × faktor ${a.basis.load_factor}`,
      }))
      .sort((x, y) => y.kwh - x.kwh);
  } else if (result.display_level === 'category') {
    // Agregasi tampilan sementara; nanti dikirim BE sebagai level kategori.
    const grouped = new Map<ApplianceCategory, number>();
    for (const a of result.per_appliance) {
      const cat = MOCK_APPLIANCES.find((m) => m.id === a.appliance_id)?.category ?? 'other';
      grouped.set(cat, (grouped.get(cat) ?? 0) + a.kwh);
    }
    rows = [...grouped.entries()]
      .map(([cat, kwh]) => ({ id: cat, label: CATEGORY_LABEL[cat], kwh, rp: rp(kwh), share: share(kwh) }))
      .sort((x, y) => y.kwh - x.kwh);
  }

  const insufficient = result.display_level === 'insufficient_data';
  return {
    id,
    label,
    hint,
    result,
    display_level: result.display_level,
    confidence: result.overall_confidence,
    total_rp: insufficient ? null : rp(meterKwh),
    unexplained_rp: insufficient || result.unexplained_kwh === null ? null : rp(result.unexplained_kwh),
    per_unit_rp: insufficient ? null : rp(meterKwh / MOCK_BUSINESS.daily_volume),
    rows,
  };
}

export const COST_SCENARIOS: Record<ScenarioId, CostScenario> = {
  appliance: buildScenario('appliance', 'Data cukup', 'Selisih meter kecil, rincian per alat tampil', 19.5, 5),
  category: buildScenario('category', 'Selisih besar', 'Turun ke tampilan kategori', 28, 5),
  insufficient: buildScenario('insufficient', 'Data < 3 hari', 'Tampil "belum cukup data"', 19.5, 1),
};

/** Riwayat 7 hari (delta meter harian, kWh) — contoh. */
export const MOCK_WEEK = [
  { day: 'Kam', kwh: 18.2 },
  { day: 'Jum', kwh: 21.4 },
  { day: 'Sab', kwh: 24.9 },
  { day: 'Min', kwh: 12.1 },
  { day: 'Sen', kwh: 19.8 },
  { day: 'Sel', kwh: 20.6 },
  { day: 'Rab', kwh: 19.5 },
].map((d) => ({ ...d, rp: rp(d.kwh) }));

/** Respons contoh P7 (`/ai/recommend`). */
export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    action_id: 'full_load_dryer',
    title: 'Isi pengering sampai penuh sebelum menyalakan',
    est_saving_kwh: { min: 1, max: 2.1 },
    est_saving_rp: { min: rp(1), max: rp(2.1) },
    confidence: 'medium',
    effort: 'low',
    score: 0.82,
    safety_note: 'Jangan melebihi kapasitas mesin.',
  },
  {
    action_id: 'iron_batch',
    title: 'Setrika sekaligus dalam satu sesi, bukan dicicil',
    est_saving_kwh: { min: 0.3, max: 0.6 },
    est_saving_rp: { min: rp(0.3), max: rp(0.6) },
    confidence: 'medium',
    effort: 'low',
    score: 0.64,
  },
  {
    action_id: 'pump_timer',
    title: 'Pasang pengatur waktu pada pompa air',
    est_saving_kwh: { min: 0.1, max: 0.3 },
    est_saving_rp: { min: rp(0.1), max: rp(0.3) },
    confidence: 'low',
    effort: 'medium',
    score: 0.41,
  },
];

/* ---------- Capture (AI Gateway mock, sama dengan fixture contracts) ---------- */

export type CaptureScenario = 'success' | 'low_confidence' | 'provider_error';

export const OCR_METER: Record<'success' | 'low_confidence', OcrMeterResponse> = {
  success: {
    request_id: 'r_ocr_meter_success_001',
    engine_version: 'ocr-meter-0.1.0',
    mode: 'mock',
    confidence: 'high',
    warnings: [],
    kwh: 12345.6,
    unit: 'kWh',
    digits_confidence: [0.99, 0.97, 0.98, 0.95, 0.9, 0.88],
    needs_retake: false,
  },
  low_confidence: {
    request_id: 'r_ocr_meter_low_002',
    engine_version: 'ocr-meter-0.1.0',
    mode: 'mock',
    confidence: 'low',
    warnings: ['decimal_digit_uncertain', 'glare_detected'],
    kwh: 12345.0,
    unit: 'kWh',
    digits_confidence: [0.99, 0.97, 0.98, 0.95, 0.9, 0.62],
    needs_retake: true,
  },
};

export const OCR_LABEL: Record<'success' | 'low_confidence', OcrLabelResponse> = {
  success: {
    request_id: 'r_ocr_label_success_001',
    engine_version: 'ocr-label-0.1.0',
    mode: 'mock',
    confidence: 'high',
    warnings: [],
    name: 'Pengering',
    brand: 'Contoh Merek',
    power_w: 3000,
    needs_retake: false,
  },
  low_confidence: {
    request_id: 'r_ocr_label_low_002',
    engine_version: 'ocr-label-0.1.0',
    mode: 'mock',
    confidence: 'low',
    warnings: ['power_unit_uncertain'],
    name: 'Mesin cuci',
    power_w: 350,
    needs_retake: true,
  },
};

export const STT_RESULT: SttExtractResponse = {
  request_id: 'r_stt_success_001',
  engine_version: 'stt-extract-0.1.0',
  mode: 'mock',
  confidence: 'medium',
  warnings: [],
  transcript:
    'Hari ini nyuci sekitar lima puluh kilo, pengering nyala dari jam sembilan sampai jam dua, setrika kira-kira empat jam.',
  entries: [
    { appliance_id: 'dryer', hours: 5, from: '09:00', to: '14:00', conf: 0.86 },
    { appliance_id: 'iron', hours: 4, conf: 0.71 },
  ],
  work_volume: { value: 50, unit: 'kg', conf: 0.9 },
  confirm_text: 'Pengering 5 jam (09.00–14.00), setrika 4 jam, cucian 50 kg. Sudah benar?',
  unmatched_terms: [],
};

export const PROVIDER_ERROR: ApiErrorBody = {
  error: {
    code: 'PROVIDER_ERROR',
    message: 'Layanan OCR sedang tidak tersedia. Coba lagi atau masukkan angka manual.',
    request_id: 'r_ocr_meter_provider_004',
    details: { provider: 'mock', retryable: true },
  },
};

export const WARNING_TEXT: Record<string, string> = {
  decimal_digit_uncertain: 'Digit terakhir kurang jelas',
  glare_detected: 'Ada pantulan cahaya di layar meter',
  power_unit_uncertain: 'Satuan daya pada label kurang jelas',
};

