import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import type { AiConfig } from './ai-config';
import { AiGatewayException } from './ai-gateway.exception';
import { MockAiService } from './mock-ai.service';

const config: AiConfig = {
  mode: 'mock',
  defaultScenario: 'success',
  allowScenarioOverride: true,
};

const service = new MockAiService(config);
const requestId = 'r_test_001';

const estimateInput = {
  business_id: 'b_123',
  window: {
    from: '2026-12-01T06:00:00+07:00',
    to: '2026-12-02T06:00:00+07:00',
  },
  appliances: [{ appliance_id: 'dryer', power_kw: 3, hours: 5, load_factor: 0.7 }],
};

const sttInput = {
  audio_ref: 'audio/mock/note-1.webm',
  appliances: [
    { id: 'dryer', name: 'Pengering' },
    { id: 'iron', name: 'Setrika' },
  ],
};

const estimateResponse = service.estimate(requestId, estimateInput);

const recommendInput = {
  business_id: 'b_123',
  estimate: estimateResponse,
  template_id: 'laundry',
  unit_label: 'kg cucian',
};

describe('MockAiService', () => {
  it('returns a C3 envelope for every success endpoint', () => {
    const responses = [
      service.ocrMeter(requestId),
      service.ocrLabel(requestId),
      service.ocrToken(requestId),
      service.sttExtract(requestId, sttInput),
      service.estimate(requestId, estimateInput),
      service.recommend(requestId, recommendInput),
      service.explain(requestId, {
        business_id: 'b_123',
        kind: 'estimate',
        result: {},
      }),
      service.ask(requestId, { business_id: 'b_123', question: 'Mana yang paling boros?' }),
    ];

    for (const response of responses) {
      expect(response.request_id).toBe(requestId);
      expect(response.mode).toBe('mock');
      expect(response.engine_version).toMatch(/^mock-/);
      expect(['high', 'medium', 'low']).toContain(response.confidence);
      expect(Array.isArray(response.warnings)).toBe(true);
    }
  });

  it('degrades OCR meter and asks for a retake at low confidence', () => {
    const response = service.ocrMeter(requestId, 'low_confidence');

    expect(response.confidence).toBe('low');
    expect(response.needs_retake).toBe(true);
    expect(response.warnings).toContain('decimal_digit_uncertain');
  });

  it('returns category-level estimate with unexplained energy when confidence is low', () => {
    const response = service.estimate(requestId, estimateInput, 'low_confidence');

    expect(response.overall_confidence).toBe('low');
    expect(response.display_level).toBe('category');
    expect(response.unexplained_kwh).toBe(17.5);
    expect(response.gap_ratio).toBe(0.625);
    expect(response.suggested_missions).toEqual(['M1', 'M4']);
  });

  it('always returns recommendation ranges, never a single certain saving', () => {
    for (const scenario of ['success', 'low_confidence'] as const) {
      const response = service.recommend(requestId, recommendInput, scenario);

      expect(response.recommendations.length).toBeLessThanOrEqual(3);
      for (const recommendation of response.recommendations) {
        expect(recommendation.est_saving_kwh.min).toBeLessThan(
          recommendation.est_saving_kwh.max,
        );
        expect(recommendation.est_saving_rp.min).toBeLessThan(
          recommendation.est_saving_rp.max,
        );
      }
    }
  });

  it('does not put new numbers in explain text', () => {
    for (const scenario of ['success', 'low_confidence'] as const) {
      const response = service.explain(
        requestId,
        { business_id: 'b_123', kind: 'estimate', result: {} },
        scenario,
      );

      expect(response.text).not.toMatch(/\d/);
      expect(response.numbers_used).toHaveLength(0);
    }
  });

  it('does not link sources when the answer has low confidence', () => {
    const response = service.ask(
      requestId,
      { business_id: 'b_123', question: 'Berapa pemakaian saya?' },
      'low_confidence',
    );

    expect(response.confidence).toBe('low');
    expect(response.sources).toHaveLength(0);
  });

  it('throws C3 errors for provider_error and insufficient_data', () => {
    const calls = [
      () => service.ocrMeter(requestId, 'provider_error'),
      () => service.ocrLabel(requestId, 'insufficient_data'),
      () => service.ocrToken(requestId, 'provider_error'),
      () => service.sttExtract(requestId, sttInput, 'insufficient_data'),
      () => service.estimate(requestId, estimateInput, 'provider_error'),
      () => service.recommend(requestId, recommendInput, 'insufficient_data'),
      () =>
        service.explain(
          requestId,
          { business_id: 'b_123', kind: 'estimate', result: {} },
          'provider_error',
        ),
      () => service.ask(requestId, { business_id: 'b_123', question: 'Halo?' }, 'insufficient_data'),
    ];

    for (const call of calls) {
      try {
        call();
        throw new Error('Expected AiGatewayException');
      } catch (error) {
        expect(error).toBeInstanceOf(AiGatewayException);
        const exception = error as AiGatewayException;
        expect([
          HttpStatus.BAD_GATEWAY,
          HttpStatus.UNPROCESSABLE_ENTITY,
        ]).toContain(exception.getStatus());
        expect(['PROVIDER_ERROR', 'INSUFFICIENT_DATA']).toContain(exception.code);
      }
    }
  });

  it('rejects an unknown forced scenario', () => {
    expect(() => service.ocrMeter(requestId, 'perfect')).toThrow(AiGatewayException);
  });
});
