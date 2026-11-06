/**
 * Mock OTP adapter untuk dev/test
 * Owner: Mahdi, Sprint: S2
 * 
 * Code selalu 123456, request_id di-cache in-memory, expiry 5 menit.
 */

import { Injectable, Logger } from '@nestjs/common';
import type { OtpAdapter } from './otp.interface';

interface OtpRequest {
  phone: string;
  code: string;
  expiresAt: number;
  used: boolean;
}

@Injectable()
export class OtpMockAdapter implements OtpAdapter {
  private readonly logger = new Logger(OtpMockAdapter.name);
  private readonly requests = new Map<string, OtpRequest>();
  private readonly MOCK_CODE = '123456';
  private readonly EXPIRY_MS = 5 * 60 * 1000; // 5 menit

  async sendOtp(phone: string): Promise<string> {
    const requestId = `req_mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const expiresAt = Date.now() + this.EXPIRY_MS;

    this.requests.set(requestId, {
      phone,
      code: this.MOCK_CODE,
      expiresAt,
      used: false,
    });

    this.logger.log(`Mock OTP sent to ${phone}: ${this.MOCK_CODE} (request_id: ${requestId})`);
    return requestId;
  }

  async verifyOtp(requestId: string, code: string): Promise<boolean> {
    const request = this.requests.get(requestId);

    if (!request) {
      this.logger.warn(`Request not found: ${requestId}`);
      return false;
    }

    if (request.used) {
      this.logger.warn(`Request already used: ${requestId}`);
      return false;
    }

    if (Date.now() > request.expiresAt) {
      this.logger.warn(`Request expired: ${requestId}`);
      return false;
    }

    if (request.code !== code) {
      this.logger.warn(`Invalid code for ${requestId}: expected ${request.code}, got ${code}`);
      return false;
    }

    request.used = true;
    this.logger.log(`OTP verified for ${requestId}`);
    return true;
  }
}
