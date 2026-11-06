/** C1 - Template Schema (JSON berversi). */
export interface NumericRange {
  min: number;
  typical: number;
  max: number;
}

export interface LoadFactor {
  typical: number;
  range: [number, number];
}

export interface UsagePattern {
  hours_per_day: NumericRange;
  always_on: boolean;
  peak_hours: string[];
}

export type ApplianceCategory = 'heater' | 'cooling' | 'lighting' | 'other';

export interface TemplateAppliance {
  id: string;
  name: string;
  icon: string;
  power_w: NumericRange;
  load_factor: LoadFactor;
  usage_pattern: UsagePattern;
  category: ApplianceCategory;
  critical: boolean;
}

export type SavingsEffort = 'low' | 'medium' | 'high';

export interface SavingsAction {
  id: string;
  title: string;
  applies_to: string[];
  saving_formula: string;
  effort: SavingsEffort;
  safety_note?: string;
}

export interface KiosTemplate {
  template_id: string;
  version: string;
  display_name: string;
  unit: {
    id: string;
    label: string;
    default_daily: number;
  };
  appliances: TemplateAppliance[];
  savings_actions: SavingsAction[];
  missions_enabled: string[];
}
