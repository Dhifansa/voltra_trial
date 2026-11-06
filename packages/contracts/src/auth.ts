/**
 * C1: Auth types untuk P2 (OTP request/verify, guest merge)
 * Owner: Mahdi
 * Sprint: S2
 */

/** P2.1: Request OTP untuk nomor WhatsApp */
export interface OtpRequestPayload {
  /** Format E.164: +62... */
  phone: string;
  /** Versi kebijakan privasi/ToS yang disetujui */
  consent_version: string;
}

export interface OtpRequestResult {
  /** ID request untuk verify */
  request_id: string;
  /** Timestamp kedaluwarsa (ISO 8601) */
  expires_at: string;
  /** Mode: 'mock' | 'provider' */
  mode: 'mock' | 'provider';
}

/** P2.2: Verify OTP code */
export interface OtpVerifyPayload {
  request_id: string;
  /** 6 digit */
  code: string;
}

export interface OtpVerifyResult {
  /** JWT session token */
  token: string;
  /** User ID (baru atau existing) */
  user_id: string;
  /** Business ID bila sudah punya profil */
  business_id?: string;
  /** Timestamp consent tercatat */
  consent_at: string;
  /** Versi consent yang disetujui */
  consent_version: string;
}

/** P2.3: Merge progres tamu ke user autentik */
export interface GuestMergePayload {
  /** Token sesi tamu dari local storage */
  guest_token: string;
}

export interface GuestMergeResult {
  /** Jumlah kios yang di-merge */
  merged_kiosks: number;
  /** Jumlah alat yang di-merge */
  merged_appliances: number;
  /** Idempoten: apakah merge benar-benar terjadi atau sudah pernah */
  was_merged: boolean;
}

/** Session token claims (JWT payload) */
export interface SessionClaims {
  /** User ID */
  sub: string;
  /** Business ID bila ada */
  business_id?: string;
  /** Role: 'guest' | 'user' */
  role: 'guest' | 'user';
  /** Issued at (Unix timestamp) */
  iat: number;
  /** Expires at (Unix timestamp) */
  exp: number;
}
