import { describe, expect, it } from 'vitest';
import { CONTRACT_VERSION } from '@voltra/contracts';
import { ENGINE_VERSION } from '@voltra/energy-calc';
import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns health metadata from shared packages', () => {
    const result = new AppController().health();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('voltra-api');
    expect(result.contractVersion).toBe(CONTRACT_VERSION);
    expect(result.engineVersion).toBe(ENGINE_VERSION);
  });
});
