import type {
  ApplianceEstimate,
  ApplianceInput,
  Confidence,
  DisplayLevel,
  EstimateInput,
  EstimateResult,
} from '@voltra/contracts';
import { CONFIDENCE_THRESHOLDS } from '@voltra/contracts';

/**
 * Versi mesin hitung. Setiap hasil C2 harus membawa nilai ini.
 * Perubahan rumus wajib menaikkan versi dan memperbarui golden test.
 */
export const ENGINE_VERSION = '0.1.0';

export interface EnergyCalcConfig {
  engineVersion: string;
  highMaxGap: number;
  mediumMaxGap: number;
  minDataDays: number;
  kwhDecimals: number;
  rpDecimals: number;
}

/** Ambang keyakinan berasal dari C6 agar tidak ada dua sumber angka. */
export const ENERGY_CALC_CONFIG: EnergyCalcConfig = {
  engineVersion: ENGINE_VERSION,
  highMaxGap: CONFIDENCE_THRESHOLDS.high_max_gap,
  mediumMaxGap: CONFIDENCE_THRESHOLDS.medium_max_gap,
  minDataDays: CONFIDENCE_THRESHOLDS.min_data_days,
  kwhDecimals: 2,
  rpDecimals: 0,
};

function assertNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} harus berupa angka finite >= 0. Diterima: ${value}.`);
  }
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function roundKwh(value: number, config: EnergyCalcConfig = ENERGY_CALC_CONFIG): number {
  assertNonNegative('kWh', value);
  return roundTo(value, config.kwhDecimals);
}

export function roundRp(value: number, config: EnergyCalcConfig = ENERGY_CALC_CONFIG): number {
  assertNonNegative('Rupiah', value);
  return roundTo(value, config.rpDecimals);
}

/**
 * Rumus dasar PRD 5.6: kWh = daya(kW) x jam x faktor_beban.
 * Satu-satunya implementasi rumus ini; modul lain wajib memakai fungsi ini.
 */
export function calculateApplianceKwh(
  powerKw: number,
  hours: number,
  loadFactor: number,
): number {
  assertNonNegative('power_kw', powerKw);
  assertNonNegative('hours', hours);
  assertNonNegative('load_factor', loadFactor);
  if (loadFactor > 1) {
    throw new RangeError(`load_factor harus <= 1. Diterima: ${loadFactor}.`);
  }
  return powerKw * hours * loadFactor;
}

/** Rp = kWh x tarif. Tarif selalu input, tidak ditulis di kode. */
export function calculateCostRp(
  kwh: number,
  tariffRpPerKwh: number,
  config: EnergyCalcConfig = ENERGY_CALC_CONFIG,
): number {
  assertNonNegative('kWh', kwh);
  assertNonNegative('tariff_rp_per_kwh', tariffRpPerKwh);
  return roundRp(kwh * tariffRpPerKwh, config);
}

export function calculateApplianceCostRp(
  appliance: ApplianceInput,
  tariffRpPerKwh: number,
  config: EnergyCalcConfig = ENERGY_CALC_CONFIG,
): number {
  const kwh = calculateApplianceKwh(
    appliance.power_kw,
    appliance.hours,
    appliance.load_factor,
  );
  return calculateCostRp(kwh, tariffRpPerKwh, config);
}

export interface ConfidenceAssessment {
  level: Confidence;
  displayLevel: DisplayLevel;
  dataDays: number;
  gapRatio: number | null;
}

/**
 * C6: data < 3 hari selalu rendah dan tampil "Belum cukup data".
 * Gap negatif (estimasi melebihi meter) juga menurunkan keyakinan,
 * karena kemungkinan jam/faktor beban terlalu tinggi (PRD 8.6).
 */
export function assessConfidence(
  gapRatio: number | null,
  dataDays: number,
  negativeGap = false,
  config: EnergyCalcConfig = ENERGY_CALC_CONFIG,
): ConfidenceAssessment {
  assertNonNegative('data_days', dataDays);
  if (gapRatio !== null) {
    assertNonNegative('gap_ratio', gapRatio);
  }

  if (dataDays < config.minDataDays) {
    return { level: 'low', displayLevel: 'insufficient_data', dataDays, gapRatio };
  }

  if (negativeGap) {
    return { level: 'low', displayLevel: 'category', dataDays, gapRatio };
  }

  if (gapRatio === null) {
    return { level: 'medium', displayLevel: 'appliance', dataDays, gapRatio };
  }

  if (gapRatio <= config.highMaxGap) {
    return { level: 'high', displayLevel: 'appliance', dataDays, gapRatio };
  }

  if (gapRatio <= config.mediumMaxGap) {
    return { level: 'medium', displayLevel: 'appliance', dataDays, gapRatio };
  }

  return { level: 'low', displayLevel: 'category', dataDays, gapRatio };
}

/**
 * Estimasi per alat dan cross-validation terhadap delta meter.
 * Gap tidak pernah dibagi ke alat lain; sisa tampil sebagai unexplained_kwh.
 */
export function estimate(
  input: EstimateInput,
  config: EnergyCalcConfig = ENERGY_CALC_CONFIG,
): EstimateResult {
  if (input.appliances.length === 0) {
    throw new RangeError('Minimal satu alat diperlukan untuk estimasi.');
  }

  const dataDays = input.data_days ?? config.minDataDays;
  assertNonNegative('data_days', dataDays);

  const rawPerAppliance = input.appliances.map((appliance) => {
    const kwh = calculateApplianceKwh(
      appliance.power_kw,
      appliance.hours,
      appliance.load_factor,
    );
    return { appliance, kwh };
  });

  const explainedRaw = rawPerAppliance.reduce((total, item) => total + item.kwh, 0);
  const meterDelta = input.meter_delta_kwh ?? null;
  if (meterDelta !== null) {
    assertNonNegative('meter_delta_kwh', meterDelta);
  }

  const gap = meterDelta === null ? null : meterDelta - explainedRaw;
  const negativeGap = gap !== null && gap < 0;
  const gapRatio =
    gap === null || meterDelta === null
      ? null
      : meterDelta === 0
        ? gap === 0
          ? 0
          : 1
        : Math.abs(gap) / meterDelta;

  const assessment = assessConfidence(gapRatio, dataDays, negativeGap, config);
  const perAppliance: ApplianceEstimate[] = rawPerAppliance.map(({ appliance, kwh }) => ({
    appliance_id: appliance.appliance_id,
    kwh: roundKwh(kwh, config),
    basis: {
      power_kw: appliance.power_kw,
      hours: appliance.hours,
      load_factor: appliance.load_factor,
    },
    confidence: assessment.level,
  }));

  const result: EstimateResult = {
    window: input.window,
    meter_delta_kwh: meterDelta,
    per_appliance: perAppliance,
    explained_kwh: roundKwh(explainedRaw, config),
    unexplained_kwh: gap === null ? null : roundKwh(Math.max(0, gap), config),
    gap_ratio: gapRatio,
    overall_confidence: assessment.level,
    display_level: assessment.displayLevel,
    engine_version: config.engineVersion,
  };

  if (assessment.displayLevel === 'insufficient_data') {
    result.next_questions = ['Berapa hari data meter yang tersedia?'];
    result.suggested_missions = ['M2'];
  } else if (assessment.level === 'low') {
    result.next_questions = ['Alat lain apa yang menyala pada periode ini?'];
    result.suggested_missions = ['M1', 'M3', 'M4'];
  }

  return result;
}
