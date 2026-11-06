/**
 * Business service test
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import type { BusinessProfilePayload } from '@voltra/contracts';

describe('BusinessService', () => {
  let service: BusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessService],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  describe('createProfile', () => {
    it('creates business profile with default unit_label', async () => {
      const payload: BusinessProfilePayload = {
        business_name: 'Warung Test',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      };

      const profile = await service.createProfile('usr_123', payload);

      expect(profile.business_id).toBeDefined();
      expect(profile.user_id).toBe('usr_123');
      expect(profile.business_name).toBe('Warung Test');
      expect(profile.unit_label).toBe('unit'); // default
    });

    it('uses custom unit_label when provided', async () => {
      const payload: BusinessProfilePayload = {
        business_name: 'Toko Test',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1699.53,
        billing_type: 'postpaid',
        unit_label: 'toko',
      };

      const profile = await service.createProfile('usr_456', payload);

      expect(profile.unit_label).toBe('toko');
    });
  });

  describe('getProfile', () => {
    it('returns profile for business owner', async () => {
      const created = await service.createProfile('usr_789', {
        business_name: 'Test Bisnis',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      });

      const profile = await service.getProfile(created.business_id, 'usr_789');

      expect(profile).toBeDefined();
      expect(profile?.business_id).toBe(created.business_id);
    });

    it('returns null for non-owner', async () => {
      const created = await service.createProfile('usr_owner', {
        business_name: 'Private Business',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      });

      const profile = await service.getProfile(created.business_id, 'usr_attacker');

      expect(profile).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('updates profile fields', async () => {
      const created = await service.createProfile('usr_update', {
        business_name: 'Original Name',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      });

      const updated = await service.updateProfile(created.business_id, 'usr_update', {
        business_name: 'Updated Name',
        electricity_rate: 1699.53,
      });

      expect(updated.business_name).toBe('Updated Name');
      expect(updated.electricity_rate).toBe(1699.53);
      expect(updated.template_id).toBe('tmp_retail_v1'); // unchanged
    });

    it('rejects update from non-owner', async () => {
      const created = await service.createProfile('usr_owner2', {
        business_name: 'Secure Business',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      });

      await expect(
        service.updateProfile(created.business_id, 'usr_attacker2', {
          business_name: 'Hacked',
        })
      ).rejects.toThrow();
    });
  });
});
