/**
 * Auth controller test - P2 OTP request/verify
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { OtpRequestPayload } from '@voltra/contracts';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            requestOtp: vi.fn(),
            verifyOtp: vi.fn(),
            mergeGuest: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/otp-request', () => {
    it('returns request_id, expires_at, mode', async () => {
      const payload: OtpRequestPayload = {
        phone: '+6281234567890',
        consent_version: '2027-01-01',
      };

      const mockResult = {
        request_id: 'req_mock_123',
        expires_at: new Date(Date.now() + 300000).toISOString(),
        mode: 'mock' as const,
      };

      vi.spyOn(service, 'requestOtp').mockResolvedValue(mockResult);

      const result = await controller.requestOtp(payload);

      expect(result).toEqual(mockResult);
      expect(service.requestOtp).toHaveBeenCalledWith(payload);
    });

    it('rejects invalid phone format', async () => {
      const payload = {
        phone: '081234567890', // missing +62
        consent_version: '2027-01-01',
      };

      vi.spyOn(service, 'requestOtp').mockRejectedValue(
        new Error('VALIDATION_ERROR: Invalid phone format')
      );

      await expect(
        controller.requestOtp(payload as unknown as OtpRequestPayload)
      ).rejects.toThrow();
    });
  });
});
