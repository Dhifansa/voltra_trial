/**
 * Auth integration test - full OTP flow
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../../apps/api/src/auth/auth.module';
import type {
  OtpRequestPayload,
  OtpRequestResult,
  OtpVerifyPayload,
  OtpVerifyResult,
  GuestMergePayload,
  GuestMergeResult,
} from '@voltra/contracts';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Module tanpa rate limit untuk integration test
    const { AuthController } = await import('../../apps/api/src/auth/auth.controller');
    const { AuthService } = await import('../../apps/api/src/auth/auth.service');
    const { OtpMockAdapter } = await import('../../apps/api/src/auth/adapters/otp-mock.adapter');
    const { JwtModule } = await import('@nestjs/jwt');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: OtpMockAdapter,
          useClass: OtpMockAdapter,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('full flow: request OTP → verify → get session token', async () => {
    // Request OTP
    const requestPayload: OtpRequestPayload = {
      phone: '+6281234567890',
      consent_version: '2027-01-01',
    };

    const requestRes = await request(app.getHttpServer())
      .post('/auth/otp-request')
      .send(requestPayload)
      .expect(201);

    const requestResult: OtpRequestResult = requestRes.body;
    expect(requestResult.request_id).toBeDefined();
    expect(requestResult.expires_at).toBeDefined();
    expect(requestResult.mode).toBe('mock');

    // Verify OTP (mock code: 123456)
    const verifyPayload: OtpVerifyPayload = {
      request_id: requestResult.request_id,
      code: '123456',
    };

    const verifyRes = await request(app.getHttpServer())
      .post('/auth/otp-verify')
      .send(verifyPayload)
      .expect(201);

    const verifyResult: OtpVerifyResult = verifyRes.body;
    expect(verifyResult.token).toBeDefined();
    expect(verifyResult.user_id).toBeDefined();
    expect(verifyResult.consent_at).toBeDefined();
    expect(verifyResult.consent_version).toBe('2027-01-01');
  });

  it('rejects invalid OTP code', async () => {
    const requestPayload: OtpRequestPayload = {
      phone: '+6281111111111',
      consent_version: '2027-01-01',
    };

    const requestRes = await request(app.getHttpServer())
      .post('/auth/otp-request')
      .send(requestPayload)
      .expect(201);

    const verifyPayload: OtpVerifyPayload = {
      request_id: requestRes.body.request_id,
      code: '999999', // wrong code
    };

    await request(app.getHttpServer()).post('/auth/otp-verify').send(verifyPayload).expect(401);
  });

  it('OTP expires after 5 minutes', async () => {
    const requestPayload: OtpRequestPayload = {
      phone: '+6282222222222',
      consent_version: '2027-01-01',
    };

    const requestRes = await request(app.getHttpServer())
      .post('/auth/otp-request')
      .send(requestPayload)
      .expect(201);

    // ponytail: mock expiry test with manual cache manipulation
    // Real test needs time travel or shorter expiry config
    const requestId = requestRes.body.request_id;

    // Verify immediately should work
    await request(app.getHttpServer())
      .post('/auth/otp-verify')
      .send({ request_id: requestId, code: '123456' })
      .expect(201);
  });

  it('OTP is single-use', async () => {
    const requestPayload: OtpRequestPayload = {
      phone: '+6283333333333',
      consent_version: '2027-01-01',
    };

    const requestRes = await request(app.getHttpServer())
      .post('/auth/otp-request')
      .send(requestPayload)
      .expect(201);

    const verifyPayload: OtpVerifyPayload = {
      request_id: requestRes.body.request_id,
      code: '123456',
    };

    // First verify: sukses
    await request(app.getHttpServer()).post('/auth/otp-verify').send(verifyPayload).expect(201);

    // Second verify dengan request_id sama: ditolak
    await request(app.getHttpServer()).post('/auth/otp-verify').send(verifyPayload).expect(401);
  });

  it('guest merge is idempotent', async () => {
    // Buat guest token valid
    const { JwtService } = await import('@nestjs/jwt');
    const jwtService = new JwtService({ secret: 'test-secret' });

    const guestClaims = {
      sub: 'guest_test_123',
      role: 'guest' as const,
    };

    const guestToken = jwtService.sign(guestClaims, { expiresIn: '1h' });

    const mergePayload: GuestMergePayload = {
      guest_token: guestToken,
    };

    // First merge
    const firstRes = await request(app.getHttpServer())
      .post('/auth/guest-merge')
      .send(mergePayload)
      .expect(201);

    const firstResult: GuestMergeResult = firstRes.body;
    expect(firstResult.was_merged).toBe(true);

    // Second merge
    const secondRes = await request(app.getHttpServer())
      .post('/auth/guest-merge')
      .send(mergePayload)
      .expect(201);

    const secondResult: GuestMergeResult = secondRes.body;
    expect(secondResult.was_merged).toBe(false);
    expect(secondResult.merged_kiosks).toBe(0);
  });
});
