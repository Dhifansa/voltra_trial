/**
 * OTP provider interface
 * Owner: Mahdi, Sprint: S2
 */

export interface OtpAdapter {
  /**
   * Kirim OTP ke nomor WhatsApp
   * @returns request_id untuk verify
   */
  sendOtp(phone: string): Promise<string>;

  /**
   * Verifikasi kode OTP
   * @returns true bila valid
   */
  verifyOtp(requestId: string, code: string): Promise<boolean>;
}
