/**
 * C1: Business profile types untuk P3
 * Owner: Mahdi
 * Sprint: S2
 */

/** P3.1: Create/update business profile */
export interface BusinessProfilePayload {
  /** Nama usaha */
  business_name: string;
  /** Template ID dari C1 TemplateId */
  template_id: string;
  /** Tarif listrik per kWh (Rp) */
  electricity_rate: number;
  /** Tipe pembayaran: prepaid (token) | postpaid (tagihan) */
  billing_type: 'prepaid' | 'postpaid';
  /** Unit label opsional (default dari template) */
  unit_label?: string;
  /** Alamat opsional */
  address?: string;
  /** Catatan opsional */
  notes?: string;
}

/** P3.2: Business profile result */
export interface BusinessProfile {
  /** Business ID */
  business_id: string;
  /** User ID pemilik */
  user_id: string;
  /** Nama usaha */
  business_name: string;
  /** Template ID */
  template_id: string;
  /** Tarif listrik per kWh (Rp) */
  electricity_rate: number;
  /** Tipe pembayaran */
  billing_type: 'prepaid' | 'postpaid';
  /** Unit label */
  unit_label: string;
  /** Alamat opsional */
  address?: string;
  /** Catatan opsional */
  notes?: string;
  /** Timestamp created */
  created_at: string;
  /** Timestamp updated */
  updated_at: string;
}
