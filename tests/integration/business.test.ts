/**
 * Business integration test
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BusinessModule } from '../../apps/api/src/business/business.module';
import type { BusinessProfilePayload, BusinessProfile } from '@voltra/contracts';
import { ELECTRICITY_RATES } from '../../apps/api/src/business/electricity-rates.config';

describe('Business Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BusinessModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates business profile with default unit_label', async () => {
    const payload: BusinessProfilePayload = {
      business_name: 'Warung Makan Sederhana',
      template_id: 'tmp_retail_v1',
      electricity_rate: 1444.7,
      billing_type: 'prepaid',
    };

    const res = await request(app.getHttpServer())
      .post('/business/profile')
      .send(payload)
      .expect(201);

    const profile: BusinessProfile = res.body;
    expect(profile.business_id).toBeDefined();
    expect(profile.business_name).toBe('Warung Makan Sederhana');
    expect(profile.unit_label).toBe('unit');
    expect(profile.electricity_rate).toBe(1444.7);
  });

  it('creates profile with custom unit_label and optionals', async () => {
    const payload: BusinessProfilePayload = {
      business_name: 'Toko Kelontong',
      template_id: 'tmp_retail_v1',
      electricity_rate: 1699.53,
      billing_type: 'postpaid',
      unit_label: 'toko',
      address: 'Jl. Test No. 123',
      notes: 'Buka 08:00-20:00',
    };

    const res = await request(app.getHttpServer())
      .post('/business/profile')
      .send(payload)
      .expect(201);

    const profile: BusinessProfile = res.body;
    expect(profile.unit_label).toBe('toko');
    expect(profile.address).toBe('Jl. Test No. 123');
    expect(profile.notes).toBe('Buka 08:00-20:00');
  });

  it('gets current user profile', async () => {
    // Create first
    const createRes = await request(app.getHttpServer())
      .post('/business/profile')
      .send({
        business_name: 'My Business',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      })
      .expect(201);

    const created: BusinessProfile = createRes.body;

    // Get current user profile
    const getRes = await request(app.getHttpServer())
      .get('/business/profile')
      .expect(200);

    const profile: BusinessProfile = getRes.body;
    expect(profile.business_id).toBe(created.business_id);
  });

  it('updates profile', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/business/profile')
      .send({
        business_name: 'Original Name',
        template_id: 'tmp_retail_v1',
        electricity_rate: 1444.7,
        billing_type: 'prepaid',
      })
      .expect(201);

    const created: BusinessProfile = createRes.body;

    const updateRes = await request(app.getHttpServer())
      .patch(`/business/profile/${created.business_id}`)
      .send({
        business_name: 'Updated Name',
        electricity_rate: 1699.53,
      })
      .expect(200);

    const updated: BusinessProfile = updateRes.body;
    expect(updated.business_name).toBe('Updated Name');
    expect(updated.electricity_rate).toBe(1699.53);
    expect(updated.template_id).toBe('tmp_retail_v1'); // unchanged
  });

  it('validates tarif config tidak hardcoded', () => {
    // Tarif harus dari config, bukan literal di kode
    expect(ELECTRICITY_RATES.length).toBeGreaterThan(0);
    
    const rate1300 = ELECTRICITY_RATES.find((r) => r.id === 'rate_r1_1300');
    expect(rate1300).toBeDefined();
    expect(rate1300?.rate).toBe(1444.7);

    const rateB2 = ELECTRICITY_RATES.find((r) => r.id === 'rate_b2_3500');
    expect(rateB2).toBeDefined();
    expect(rateB2?.rate).toBe(1699.53);
  });

  it('accepts any rate value from config', async () => {
    const subsidyRate = ELECTRICITY_RATES.find((r) => r.id === 'rate_r1_900');

    const payload: BusinessProfilePayload = {
      business_name: 'Warung Subsidi',
      template_id: 'tmp_retail_v1',
      electricity_rate: subsidyRate!.rate,
      billing_type: 'prepaid',
    };

    const res = await request(app.getHttpServer())
      .post('/business/profile')
      .send(payload)
      .expect(201);

    const profile: BusinessProfile = res.body;
    expect(profile.electricity_rate).toBe(1352);
  });
});
