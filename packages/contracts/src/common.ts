/**
 * Versi kontrak C1-C6. Dinaikkan lewat PR kontrak terpisah.
 * v0.1.0 = release candidate S1 (menunggu persetujuan empat pemilik area).
 */
export const CONTRACT_VERSION = '0.1.0';

export type Confidence = 'high' | 'medium' | 'low';

export type AiMode = 'mock' | 'hybrid' | 'live';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'LOW_CONFIDENCE'
  | 'PROVIDER_ERROR'
  | 'RATE_LIMITED'
  | 'INSUFFICIENT_DATA';

export interface TimeWindow {
  from: string;
  to: string;
}

/** Field umum semua respons AI (C3). */
export interface AiEnvelope {
  request_id: string;
  engine_version: string;
  mode: AiMode;
  confidence: Confidence;
  warnings: string[];
}

/** Bentuk error tunggal untuk semua endpoint (C3). */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    request_id: string;
    details?: Record<string, unknown>;
  };
}
