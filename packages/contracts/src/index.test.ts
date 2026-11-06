import { describe, expect, it } from 'vitest';
import { CONTRACT_VERSION } from './index';

describe('contracts', () => {
  it('exposes a contract version', () => {
    expect(CONTRACT_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});
