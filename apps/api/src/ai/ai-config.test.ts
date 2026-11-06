import { describe, expect, it } from 'vitest';
import { resolveAiConfig } from './ai-config';

describe('resolveAiConfig', () => {
  it('defaults to mock and success in development', () => {
    const config = resolveAiConfig({});

    expect(config).toEqual({
      mode: 'mock',
      defaultScenario: 'success',
      allowScenarioOverride: true,
    });
  });

  it('rejects mock in pilot', () => {
    expect(() => resolveAiConfig({ APP_ENV: 'pilot', AI_MODE: 'mock' })).toThrow(
      /tidak diizinkan/,
    );
  });

  it('rejects mock in production via NODE_ENV', () => {
    expect(() => resolveAiConfig({ NODE_ENV: 'production', AI_MODE: 'mock' })).toThrow(
      /tidak diizinkan/,
    );
  });

  it('allows live in production', () => {
    const config = resolveAiConfig({ NODE_ENV: 'production', AI_MODE: 'live' });

    expect(config.mode).toBe('live');
    expect(config.allowScenarioOverride).toBe(false);
  });

  it('rejects unknown modes and scenarios', () => {
    expect(() => resolveAiConfig({ AI_MODE: 'magic' })).toThrow(/AI_MODE/);
    expect(() => resolveAiConfig({ AI_SCENARIO: 'perfect' })).toThrow(/AI_SCENARIO/);
  });
});
