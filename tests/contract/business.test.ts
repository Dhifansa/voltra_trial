/**
 * Contract test C2: Business profile validation
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { BusinessProfilePayload, BusinessProfile } from '@voltra/contracts';

const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);

describe('C2: Business profile contract validation', () => {
  describe('BusinessProfilePayload', () => {
    const schema = {
      type: 'object',
      required: ['business_name', 'template_id', 'electricity_rate', 'billing_type'],
      properties: {
        business_name: { type: 'string', minLength: 1, maxLength: 100 },
        template_id: { type: 'string', minLength: 1 },
        electricity_rate: { type: 'number', minimum: 0 },
        billing_type: { type: 'string', enum: ['prepaid', 'postpaid'] },
        unit_label: { type: 'string', minLength: 1, maxLength: 50 },
        address: { type: 'string', maxLength: 500 },
        notes: { type: 'string', maxLength: 1000 },
      },
      additionalProperties: false,
    };

    it('validates minimal payload', () => {
      const payload: BusinessProfilePayload = {
        business_name: 'Warung Makan Sederhana',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      };
      const validate = ajv.compile(schema);
      expect(validate(payload)).toBe(true);
    });

    it('validates full payload with optionals', () => {
      const payload: BusinessProfilePayload = {
        business_name: 'Toko Kelontong Makmur',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1699.53,
        billing_type: 'postpaid',
        unit_label: 'outlet',
        address: 'Jl. Sudirman No. 123',
        notes: 'Buka 24 jam',
      };
      const validate = ajv.compile(schema);
      expect(validate(payload)).toBe(true);
    });

    it('rejects empty business_name', () => {
      const validate = ajv.compile(schema);
      expect(
        validate({
          business_name: '',
          template_id: 'tmp_retail_v1',
          electricity_rate: 1444.7,
          billing_type: 'prepaid',
        })
      ).toBe(false);
    });

    it('rejects negative rate', () => {
      const validate = ajv.compile(schema);
      expect(
        validate({
          business_name: 'Test',
          template_id: 'tmp_retail_v1',
          electricity_rate: -100,
          billing_type: 'prepaid',
        })
      ).toBe(false);
    });

    it('rejects invalid billing_type', () => {
      const validate = ajv.compile(schema);
      expect(
        validate({
          business_name: 'Test',
          template_id: 'tmp_retail_v1',
          electricity_rate: 1444.7,
          billing_type: 'monthly',
        })
      ).toBe(false);
    });
  });

  describe('BusinessProfile', () => {
    const schema = {
      type: 'object',
      required: [
        'business_id',
        'user_id',
        'business_name',
        'template_id',
        'electricity_rate',
        'billing_type',
        'unit_label',
        'created_at',
        'updated_at',
      ],
      properties: {
        business_id: { type: 'string', minLength: 1 },
        user_id: { type: 'string', minLength: 1 },
        business_name: { type: 'string', minLength: 1 },
        template_id: { type: 'string', minLength: 1 },
        electricity_rate: { type: 'number', minimum: 0 },
        billing_type: { type: 'string', enum: ['prepaid', 'postpaid'] },
        unit_label: { type: 'string', minLength: 1 },
        address: { type: 'string' },
        notes: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
    };

    it('validates minimal profile', () => {
      const profile: BusinessProfile = {
        business_id: 'biz_123',
        user_id: 'usr_456',
        business_name: 'Warung Test',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
        unit_label: 'unit',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const validate = ajv.compile(schema);
      expect(validate(profile)).toBe(true);
    });

    it('validates full profile with optionals', () => {
      const profile: BusinessProfile = {
        business_id: 'biz_789',
        user_id: 'usr_012',
        business_name: 'Toko Lengkap',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1699.53,
        billing_type: 'postpaid',
        unit_label: 'toko',
        address: 'Jl. Test',
        notes: 'Catatan',
        created_at: '2027-01-01T10:00:00Z',
        updated_at: '2027-01-01T10:00:00Z',
      };
      const validate = ajv.compile(schema);
      expect(validate(profile)).toBe(true);
    });
  });
});
