/** C5 - Entitlement. */
export type EntitlementStatus = 'free' | 'trial' | 'plus' | 'locked';

export interface EntitlementFeatures {
  kios: boolean;
  m1: boolean;
  ai_analysis: boolean;
  wati_real_data: boolean;
  cosmetic_rewards: boolean;
}

export interface Entitlement {
  business_id: string;
  status: EntitlementStatus;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  features: EntitlementFeatures;
  updated_at: string;
}
