import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import SwaggerParser from '@apidevtools/swagger-parser';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const contractsDir = join(root, 'packages', 'contracts');
const schemasDir = join(contractsDir, 'schemas');
const fixturesDir = join(contractsDir, 'fixtures');
const openapiPath = join(contractsDir, 'openapi.yaml');

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

for (const file of readdirSync(schemasDir)) {
  if (file.endsWith('.schema.json')) {
    ajv.addSchema(readJson(join(schemasDir, file)));
  }
}

function validate(schemaId: string, data: unknown): boolean {
  const validator = ajv.getSchema(schemaId);
  if (!validator) throw new Error(`Schema not registered: ${schemaId}`);
  const result = validator(data);
  if (typeof result !== 'boolean') {
    throw new Error(`Schema is async, which is not supported: ${schemaId}`);
  }
  if (!result) {
    throw new Error(ajv.errorsText(validator.errors, { separator: '\n' }));
  }
  return result;
}

type OpenApiOperation = {
  operationId?: string;
  'x-pipeline'?: string;
};

type OpenApiDocument = {
  info: { version: string };
  paths?: Record<string, Record<string, OpenApiOperation>>;
  components?: { schemas?: Record<string, unknown> };
};

async function validateOpenApi(): Promise<OpenApiDocument> {
  return (await SwaggerParser.validate(openapiPath)) as unknown as OpenApiDocument;
}

describe('C1-C6 fixtures', () => {
  const cases = [
    [
      'C1 template',
      'https://voltra.local/schemas/c1-template.schema.json',
      join(fixturesDir, 'templates', 'laundry.json'),
    ],
    [
      'C2 estimate',
      'https://voltra.local/schemas/c2-estimate.schema.json',
      join(fixturesDir, 'estimates', 'estimate-low-confidence.json'),
    ],
    [
      'C3 envelope success',
      'https://voltra.local/schemas/c3-ai-envelope.schema.json',
      join(fixturesDir, 'ai', 'ocr-meter.success.json'),
    ],
    [
      'C3 envelope low confidence',
      'https://voltra.local/schemas/c3-ai-envelope.schema.json',
      join(fixturesDir, 'ai', 'ocr-meter.low-confidence.json'),
    ],
    [
      'C4 mission event',
      'https://voltra.local/schemas/c4-mission-event.schema.json',
      join(fixturesDir, 'missions', 'mission-completed.json'),
    ],
    [
      'C5 entitlement',
      'https://voltra.local/schemas/c5-entitlement.schema.json',
      join(fixturesDir, 'entitlements', 'trial-entitlement.json'),
    ],
    [
      'C6 confidence',
      'https://voltra.local/schemas/c6-confidence.schema.json',
      join(fixturesDir, 'confidence', 'low-confidence.json'),
    ],
  ] as const;

  for (const [name, schemaId, fixturePath] of cases) {
    it(`validates ${name}`, () => {
      expect(validate(schemaId, readJson(fixturePath))).toBe(true);
    });
  }

  it('validates insufficient_data and provider_error fixtures', () => {
    const schemaId = 'https://voltra.local/schemas/c3-error.schema.json';

    expect(
      validate(schemaId, readJson(join(fixturesDir, 'ai', 'estimate.insufficient-data.json'))),
    ).toBe(true);
    expect(
      validate(schemaId, readJson(join(fixturesDir, 'ai', 'ocr-meter.provider-error.json'))),
    ).toBe(true);
  });

  it('rejects a template without template_id', () => {
    const fixture = readJson<Record<string, unknown>>(
      join(fixturesDir, 'templates', 'laundry.json'),
    );
    delete fixture.template_id;

    expect(() =>
      validate('https://voltra.local/schemas/c1-template.schema.json', fixture),
    ).toThrow();
  });
});

describe('C3 OpenAPI', () => {
  it('validates the document and external refs', async () => {
    const api = await validateOpenApi();

    expect(api.info.version).toBe('0.1.0');
    expect(Object.keys(api.paths ?? {})).toHaveLength(8);
    expect(api.paths?.['/ai/estimate']?.post?.operationId).toBe('estimate');
    expect(api.components?.schemas?.ImpactVerificationResult).toBeDefined();
  });

  it('covers P1-P10 in the operation metadata', async () => {
    const api = await validateOpenApi();
    const pipelines = Object.values(api.paths ?? {})
      .flatMap((path) => Object.values(path))
      .map((operation) => operation['x-pipeline'])
      .filter((value): value is string => Boolean(value));

    expect(pipelines).toEqual(
      expect.arrayContaining(['P1', 'P2', 'P3', 'P4', 'P5/P6', 'P7', 'P8', 'P10']),
    );
    expect(api.components?.schemas?.ImpactVerificationResult).toMatchObject({
      description: expect.stringContaining('P9'),
    });
  });
});
