import type { Confidence } from './common';

/** C4 - Mission Event. */
export type MissionType = 'mission_completed';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export interface MissionPayload {
  capture_id?: string;
  meter_kwh?: number;
  window?: string;
  [key: string]: unknown;
}

export interface MissionEvent {
  event_id: string;
  type: MissionType;
  mission_id: string;
  business_id: string;
  occurred_at: string;
  payload: MissionPayload;
  verification: {
    status: VerificationStatus;
    reason: string | null;
    confidence: Confidence;
  };
  reward: {
    points: number;
    badge: string | null;
  };
}
