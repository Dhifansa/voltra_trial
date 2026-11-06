/**
 * Contract test C2: Auth P2 types validation
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type {
  OtpRequestPayload,
  OtpRequestResult,
  OtpVerifyPayload,
  OtpVerifyResult,
  GuestMergePayload,
  GuestMergeResult,
  SessionClaims,
} from '@voltra/contracts';

const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);

describe('C2: Auth contract validation', () => {
  describe('OtpRequestPayload', () => {
    const schema = {
      type: 'object',
      required: ['phone', 'consent_version'],
      properties: {
        phone: { type: 'string', pattern: '^\\+62[0-9]{9,13}$' },
        consent_version: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
    };

    it('validates correct payload', () => {
      const payload: OtpRequestPayload = {
        phone: '+6281234567890',
        consent_version: '2027-01-01',
      };
      const validate = ajv.compile(schema);
      expect(validate(payload)).toBe(true);
    });

    it('rejects invalid phone format', () => {
      const validate = ajv.compile(schema);
      expect(validate({ phone: '081234567890', consent_version: '1.0' })).toBe(false);
      expect(validate({ phone: '+1234567890', consent_version: '1.0' })).toBe(false);
    });

    it('rejects missing consent_version', () => {
      const validate = ajv.compile(schema);
      expect(validate({ phone: '+6281234567890' })).toBe(false);
    });
  });

  describe('OtpRequestResult', () => {
    const schema = {
      type: 'object',
      required: ['request_id', 'expires_at', 'mode'],
      properties: {
        request_id: { type: 'string', minLength: 1 },
        expires_at: { type: 'string', format: 'date-time' },
        mode: { type: 'string', enum: ['mock', 'provider'] },
      },
      additionalProperties: false,
    };

    it('validates mock result', () => {
      const result: OtpRequestResult = {
        request_id: 'req_123',
        expires_at: new Date(Date.now() + 300000).toISOString(),
        mode: 'mock',
      };
      const validate = ajv.compile(schema);
      expect(validate(result)).toBe(true);
    });

    it('validates provider result', () => {
      const result: OtpRequestResult = {
        request_id: 'req_456',
        expires_at: '2027-02-01T10:00:00Z',
        mode: 'provider',
      };
      const validate = ajv.compile(schema);
      expect(validate(result)).toBe(true);
    });

    it('rejects invalid mode', () => {
      const validate = ajv.compile(schema);
      expect(
        validate({
          request_id: 'req_123',
          expires_at: '2027-02-01T10:00:00Z',
          mode: 'invalid',
        })
      ).toBe(false);
    });
  });

  describe('OtpVerifyPayload', () => {
    const schema = {
      type: 'object',
      required: ['request_id', 'code'],
      properties: {
        request_id: { type: 'string', minLength: 1 },
        code: { type: 'string', pattern: '^[0-9]{6}$' },
      },
      additionalProperties: false,
    };

    it('validates correct payload', () => {
      const payload: OtpVerifyPayload = {
        request_id: 'req_123',
        code: '123456',
      };
      const validate = ajv.compile(schema);
      expect(validate(payload)).toBe(true);
    });

    it('rejects non-6-digit code', () => {
      const validate = ajv.compile(schema);
      expect(validate({ request_id: 'req_123', code: '12345' })).toBe(false);
      expect(validate({ request_id: 'req_123', code: '1234567' })).toBe(false);
      expect(validate({ request_id: 'req_123', code: 'abcdef' })).toBe(false);
    });
  });

  describe('OtpVerifyResult', () => {
    const schema = {
      type: 'object',
      required: ['token', 'user_id', 'consent_at', 'consent_version'],
      properties: {
        token: { type: 'string', minLength: 20 },
        user_id: { type: 'string', minLength: 1 },
        business_id: { type: 'string', minLength: 1 },
        consent_at: { type: 'string', format: 'date-time' },
        consent_version: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
    };

    it('validates result with business_id', () => {
      const result: OtpVerifyResult = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        user_id: 'usr_123',
        business_id: 'biz_456',
        consent_at: new Date().toISOString(),
        consent_version: '2027-01-01',
      };
      const validate = ajv.compile(schema);
      expect(validate(result)).toBe(true);
    });

    it('validates result without business_id', () => {
      const result: OtpVerifyResult = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        user_id: 'usr_789',
        consent_at: '2027-02-01T10:00:00Z',
        consent_version: '2027-01-01',
      };
      const validate = ajv.compile(schema);
      expect(validate(result)).toBe(true);
    });
  });

  describe('GuestMergePayload', () => {
    const schema = {
      type: 'object',
      required: ['guest_token'],
      properties: {
        guest_token: { type: 'string', minLength: 20 },
      },
      additionalProperties: false,
    };

    it('validates correct payload', () => {
      const payload: GuestMergePayload = {
        guest_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.guest',
      };
      const validate = ajv.compile(schema);
      expect(validate(payload)).toBe(true);
    });

    it('rejects too-short token', () => {
      const validate = ajv.compile(schema);
      expect(validate({ guest_token: 'short' })).toBe(false);
    });
  });

  describe('GuestMergeResult', () => {
    const schema = {
      type: 'object',
      required: ['merged_kiosks', 'merged_appliances', 'was_merged'],
      properties: {
        merged_kiosks: { type: 'integer', minimum: 0 },
        merged_appliances: { type: 'integer', minimum: 0 },
        was_merged: { type: 'boolean' },
      },
      additionalProperties: false,
    };

    it('validates first-time merge', () => {
      const result: GuestMergeResult = {
        merged_kiosks: 2,
        merged_appliances: 5,
        was_merged: true,
      };
      const validate = ajv.compile(schema);
      expect(validate(result)).toBe(true);
    });

    it('validates idempotent no-op merge', () => {
      const result: GuestMergeResult = {
        merged_kiosks: 0,
        merged_appliances: 0,
        was_merged: false,
      };
      const validate = ajv.compile(schema);
      expect(validate(result)).toBe(true);
    });
  });

  describe('SessionClaims', () => {
    const schema = {
      type: 'object',
      required: ['sub', 'role', 'iat', 'exp'],
      properties: {
        sub: { type: 'string', minLength: 1 },
        business_id: { type: 'string', minLength: 1 },
        role: { type: 'string', enum: ['guest', 'user'] },
        iat: { type: 'integer', minimum: 0 },
        exp: { type: 'integer', minimum: 0 },
      },
      additionalProperties: false,
    };

    it('validates user session', () => {
      const claims: SessionClaims = {
        sub: 'usr_123',
        business_id: 'biz_456',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      const validate = ajv.compile(schema);
      expect(validate(claims)).toBe(true);
    });

    it('validates guest session', () => {
      const claims: SessionClaims = {
        sub: 'guest_789',
        role: 'guest',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const validate = ajv.compile(schema);
      expect(validate(claims)).toBe(true);
    });

    it('rejects invalid role', () => {
      const validate = ajv.compile(schema);
      expect(
        validate({
          sub: 'usr_123',
          role: 'admin',
          iat: 1234567890,
          exp: 1234571490,
        })
      ).toBe(false);
    });
  });
});
