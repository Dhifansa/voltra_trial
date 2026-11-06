/**
 * Auth service - OTP request/verify, guest merge
 * Owner: Mahdi, Sprint: S2
 */

import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  OtpRequestPayload,
  OtpRequestResult,
  OtpVerifyPayload,
  OtpVerifyResult,
  GuestMergePayload,
  GuestMergeResult,
  SessionClaims,
} from '@voltra/contracts';
import type { OtpAdapter } from './adapters/otp.interface';
import { OtpMockAdapter } from './adapters/otp-mock.adapter';

@Injectable()
export class AuthService {
  private readonly mergeCache = new Set<string>(); // ponytail: in-memory, DB nanti

  constructor(
    @Inject(OtpMockAdapter) private readonly otpAdapter: OtpAdapter,
    private readonly jwtService: JwtService,
  ) {}

  async requestOtp(payload: OtpRequestPayload): Promise<OtpRequestResult> {
    // Validasi phone format E.164
    if (!/^\+62[0-9]{9,13}$/.test(payload.phone)) {
      throw new BadRequestException('Invalid phone format. Expected E.164: +62...');
    }

    const requestId = await this.otpAdapter.sendOtp(payload.phone);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // ponytail: simpan consent_version untuk verify nanti (in-memory dulu)
    (this as any)._consentCache = (this as any)._consentCache || new Map();
    (this as any)._consentCache.set(requestId, payload.consent_version);

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

    // ponytail: mock user creation, DB nanti
    const userId = `usr_mock_${Date.now()}`;
    const consentAt = new Date();
    const consentVersion =
      (this as any)._consentCache?.get(payload.request_id) ?? '2027-01-01';

    const claims: Omit<SessionClaims, 'iat' | 'exp'> = {
      sub: userId,
      role: 'user',
    };

    const token = this.jwtService.sign(claims);

    return {
      token,
      user_id: userId,
      consent_at: consentAt.toISOString(),
      consent_version: consentVersion,
    };
  }

  async mergeGuest(userId: string, payload: GuestMergePayload): Promise<GuestMergeResult> {
    let claims: SessionClaims;

    try {
      claims = this.jwtService.verify<SessionClaims>(payload.guest_token);
    } catch {
      throw new UnauthorizedException('Invalid guest token');
    }

    if (claims.role !== 'guest') {
      throw new BadRequestException('Token must be a guest session');
    }

    const mergeKey = `${claims.sub}:${userId}`;

    // Idempoten: cek apakah sudah pernah merge
    if (this.mergeCache.has(mergeKey)) {
      return {
        merged_kiosks: 0,
        merged_appliances: 0,
        was_merged: false,
      };
    }

    // ponytail: mock merge logic, DB transfer nanti
    const mergedKiosks = 2;
    const mergedAppliances = 5;

    this.mergeCache.add(mergeKey);

    return {
      merged_kiosks: mergedKiosks,
      merged_appliances: mergedAppliances,
      was_merged: true,
    };
  }
}
