/**
 * Auth service - OTP request/verify, guest merge
 * Owner: Mahdi, Sprint: S2
 */

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import type {
  OtpRequestPayload,
  OtpRequestResult,
  OtpVerifyPayload,
  OtpVerifyResult,
} from '@voltra/contracts';
import type { OtpAdapter } from './adapters/otp.interface';

@Injectable()
export class AuthService {
  constructor(private readonly otpAdapter: OtpAdapter) {}

  async requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResult> {
    // Validasi phone format E.164
    if (!/^\+62[0-9]{9,13}$/.test(payload.phone)) {
      throw new BadRequestException('Invalid phone format. Expected E.164: +62...');
    }

    const requestId = await this.otpAdapter.sendOtp(payload.phone);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    return {
      request_id: requestId,
      expires_at: expiresAt,
      mode: 'mock', // ponytail: hardcoded, provider detection nanti
    };
  }

  async verifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyResult> {
    const valid = await this.otpAdapter.verifyOtp(payload.request_id, payload.code);

    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // ponytail: mock user creation, DB nanti Slice 3
    const userId = `usr_mock_${Date.now()}`;
    const token = `mock_token_${userId}`;

    return {
      token,
      user_id: userId,
      consent_at: new Date().toISOString(),
      consent_version: '2027-01-01', // ponytail: hardcoded, dari request nanti
    };
  }
}
