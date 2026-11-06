import type { Confidence, TimeWindow } from './common';

/** C2 - Input estimasi per alat. */
export interface ApplianceInput {
  appliance_id: string;
  power_kw: number;
  hours: number;
  load_factor: number;
}

export interface EstimateInput {
  window: TimeWindow;
  appliances: ApplianceInput[];
  meter_delta_kwh?: number;
  engine_version: string;
}

export interface ApplianceBasis {
  power_kw: number;
  hours: number;
  load_factor: number;
}

export interface ApplianceEstimate {
  appliance_id: string;
  kwh: number;
  basis: ApplianceBasis;
  confidence: Confidence;
}

export type DisplayLevel = 'appliance' | 'category' | 'insufficient_data';

/** C2 - Hasil estimasi + cross-validation. */
export interface EstimateResult {
  window: TimeWindow;
  meter_delta_kwh: number | null;
  per_appliance: ApplianceEstimate[];
  explained_kwh: number;
  unexplained_kwh: number | null;
  gap_ratio: number | null;
  overall_confidence: Confidence;
  display_level: DisplayLevel;
  next_questions?: string[];
  suggested_missions?: string[];
  engine_version: string;
}
