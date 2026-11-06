import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import type { AiConfig } from '../../apps/api/src/ai/ai-config';
import { MockAiService } from '../../apps/api/src/ai/mock-ai.service';

const schemasDir = join(process.cwd(), 'packages', 'contracts', 'schemas');
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

for (const file of readdirSync(schemasDir)) {
  if (file.endsWith('.schema.json')) {
    ajv.addSchema(JSON.parse(readFileSync(join(schemasDir, file), 'utf8')) as object);
  }
}

function validate(schemaId: string, data: unknown): void {
  const validator = ajv.getSchema(schemaId);
  if (!validator) throw new Error(`Schema not registered: ${schemaId}`);
  const result = validator(data);
  if (typeof result !== 'boolean') throw new Error(`Async schema: ${schemaId}`);
  if (!result) {
    throw new Error(ajv.errorsText(validator.errors, { separator: '\n' }));
  }
}

const config: AiConfig = {
  mode: 'mock',
  defaultScenario: 'success',
  allowScenarioOverride: true,
};

const service = new MockAiService(config);
const requestId = 'r_contract_mock_001';

const estimateInput = {
  business_id: 'b_123',
  window: {
    from: '2026-12-01T06:00:00+07:00',
    to: '2026-12-02T06:00:00+07:00',
  },
  appliances: [{ appliance_id: 'dryer', power_kw: 3, hours: 5, load_factor: 0.7 }],
};

describe('mock AI responses against C3/C2 schemas', () => {
  const envelopeSchema = 'https://voltra.local/schemas/c3-ai-envelope.schema.json';

  it('validates P1-P4 success envelopes', () => {
    const responses = [
      service.ocrMeter(requestId),
      service.ocrLabel(requestId),
      service.ocrToken(requestId),
      service.sttExtract(requestId, {
        audio_ref: 'audio/mock/note-1.webm',
        appliances: [{ id: 'dryer', name: 'Pengering' }],
      }),
    ];

    for (const response of responses) {
      expect(() => validate(envelopeSchema, response)).not.toThrow();
    }
  });

  it('validates P5 estimate and its nested C2 result', () => {
    const response = service.estimate(requestId, estimateInput);

    expect(() => validate(envelopeSchema, response)).not.toThrow();
    expect(() =>
      validate('https://voltra.local/schemas/c2-estimate.schema.json', response),
    ).not.toThrow();
  });

  it('validates P7, P8, and P10 success envelopes', () => {
    const estimate = service.estimate(requestId, estimateInput);
    const responses = [
      service.recommend(requestId, {
        business_id: 'b_123',
        estimate,
        template_id: 'laundry',
        unit_label: 'kg cucian',
      }),
      service.explain(requestId, { business_id: 'b_123', kind: 'estimate', result: {} }),
      service.ask(requestId, { business_id: 'b_123', question: 'Mana yang paling boros?' }),
    ];

    for (const response of responses) {
      expect(() => validate(envelopeSchema, response)).not.toThrow();
    }
  });

  it('keeps low-confidence envelopes valid and marked as mock', () => {
    const responses = [
      service.ocrMeter(requestId, 'low_confidence'),
      service.ocrLabel(requestId, 'low_confidence'),
      service.ocrToken(requestId, 'low_confidence'),
      service.sttExtract(
        requestId,
        { audio_ref: 'audio/mock/note-1.webm', appliances: [] },
        'low_confidence',
      ),
      service.estimate(requestId, estimateInput, 'low_confidence'),
      service.recommend(
        requestId,
        {
          business_id: 'b_123',
          estimate: service.estimate(requestId, estimateInput),
          template_id: 'laundry',
          unit_label: 'kg cucian',
        },
        'low_confidence',
      ),
      service.explain(
        requestId,
        { business_id: 'b_123', kind: 'estimate', result: {} },
        'low_confidence',
      ),
      service.ask(
        requestId,
        { business_id: 'b_123', question: 'Berapa pemakaian saya?' },
        'low_confidence',
      ),
    ];

    for (const response of responses) {
      expect(() => validate(envelopeSchema, response)).not.toThrow();
      expect(response.mode).toBe('mock');
    }
  });
});
