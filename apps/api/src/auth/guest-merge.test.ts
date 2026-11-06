/**
 * Guest merge test
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { OtpMockAdapter } from './adapters/otp-mock.adapter';
import type { GuestMergePayload, SessionClaims } from '@voltra/contracts';

describe('AuthService.mergeGuest', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockAdapter = new OtpMockAdapter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(),
            verify: vi.fn(),
          },
        },
        {
          provide: OtpMockAdapter,
          useValue: mockAdapter,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('merges guest data and returns counts', async () => {
    const guestClaims: SessionClaims = {
      sub: 'guest_123',
      role: 'guest',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    vi.spyOn(jwtService, 'verify').mockReturnValue(guestClaims as any);

    const payload: GuestMergePayload = {
      guest_token: 'guest_token_123',
    };

    // ponytail: mock merge logic, DB nanti
    const result = await service.mergeGuest('usr_current', payload);

    expect(result.merged_kiosks).toBeGreaterThanOrEqual(0);
    expect(result.merged_appliances).toBeGreaterThanOrEqual(0);
    expect(result.was_merged).toBe(true);
  });

  it('is idempotent - second merge returns was_merged=false', async () => {
    const guestClaims: SessionClaims = {
      sub: 'guest_456',
      role: 'guest',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    vi.spyOn(jwtService, 'verify').mockReturnValue(guestClaims as any);

    const payload: GuestMergePayload = {
      guest_token: 'guest_token_456',
    };

    const first = await service.mergeGuest('usr_current', payload);
    expect(first.was_merged).toBe(true);

    const second = await service.mergeGuest('usr_current', payload);
    expect(second.was_merged).toBe(false);
    expect(second.merged_kiosks).toBe(0);
    expect(second.merged_appliances).toBe(0);
  });

  it('rejects non-guest token', async () => {
    const userClaims: SessionClaims = {
      sub: 'usr_789',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    };

    vi.spyOn(jwtService, 'verify').mockReturnValue(userClaims as any);

    const payload: GuestMergePayload = {
      guest_token: 'user_token_789',
    };

    await expect(service.mergeGuest('usr_current', payload)).rejects.toThrow(
      'Token must be a guest session'
    );
  });
});
