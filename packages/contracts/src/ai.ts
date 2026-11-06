import type { AiEnvelope, Confidence, TimeWindow } from './common';
import type { EstimateResult } from './energy';

/** C3 - DTO wire AI Gateway. Semua field JSON memakai snake_case. */

export interface OcrMeterResponse extends AiEnvelope {
  kwh: number;
  unit: 'kWh';
  digits_confidence: number[];
  needs_retake: boolean;
  bbox?: [number, number, number, number];
}

export interface OcrLabelResponse extends AiEnvelope {
  name: string;
  power_w: number;
  brand?: string;
  needs_retake: boolean;
}

export interface OcrTokenResponse extends AiEnvelope {
  date: string;
  amount_rp: number;
  kwh: number | null;
  remaining_kwh: number | null;
  needs_retake: boolean;
}

export interface SttApplianceRef {
  id: string;
  name: string;
}

export interface SttExtractRequest {
  audio_ref: string;
  appliances: SttApplianceRef[];
  language?: string;
}

export interface SttEntry {
  appliance_id: string;
  hours: number;
  from?: string;
  to?: string;
  conf: number;
}

export interface SttExtractResponse extends AiEnvelope {
  transcript: string;
  entries: SttEntry[];
  work_volume: {
    value: number;
    unit: string;
    conf: number;
  } | null;
  confirm_text: string;
  unmatched_terms: string[];
}

export interface EstimateRequest {
  business_id: string;
  window: TimeWindow;
  appliances: Array<{
    appliance_id: string;
    power_kw: number;
    hours: number;
    load_factor: number;
  }>;
  meter_delta_kwh?: number;
}

export interface EstimateResponse extends AiEnvelope, EstimateResult {}

export type RecommendationEffort = 'low' | 'medium' | 'high';

export interface Recommendation {
  action_id: string;
  title: string;
  est_saving_kwh: {
    min: number;
    max: number;
  };
  est_saving_rp: {
    min: number;
    max: number;
  };
  confidence: Confidence;
  effort: RecommendationEffort;
  score: number;
  safety_note?: string;
}

export interface RecommendRequest {
  business_id: string;
  estimate: EstimateResult;
  template_id: string;
  unit_label: string;
}

export interface RecommendResponse extends AiEnvelope {
  recommendations: Recommendation[];
}

export interface ExplainRequest {
  business_id: string;
  kind: 'estimate' | 'recommendation' | 'report';
  result: Record<string, unknown>;
}

export interface ExplainResponse extends AiEnvelope {
  text: string;
  numbers_used: number[];
  fallback_used: boolean;
}

export interface AskRequest {
  business_id: string;
  question: string;
  conversation_id?: string;
}

export type AskSourceType =
  | 'estimate'
  | 'usage_notes'
  | 'recommendation'
  | 'token_forecast';

export interface AskSource {
  type: AskSourceType;
  id?: string;
  range?: string;
}

export interface AskResponse extends AiEnvelope {
  answer: string;
  sources: AskSource[];
  disclaimer: string;
  followup_mission: string | null;
}
