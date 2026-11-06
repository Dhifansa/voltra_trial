import type { Confidence } from './common';
import type { DisplayLevel } from './energy';

/** C6 - Tingkat keyakinan. Ambang adalah konfigurasi, bukan angka tersebar. */
export const CONFIDENCE_THRESHOLDS = {
  high_max_gap: 0.15,
  medium_max_gap: 0.35,
  min_data_days: 3,
} as const;

export interface ConfidenceAssessment {
  level: Confidence;
  gap_ratio: number | null;
  data_days: number;
  display_level: DisplayLevel;
  thresholds: typeof CONFIDENCE_THRESHOLDS;
}
