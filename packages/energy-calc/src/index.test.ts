import { describe, expect, it } from 'vitest';
import type { EstimateInput } from '@voltra/contracts';
import {
  ENGINE_VERSION,
  ENERGY_CALC_CONFIG,
  assessConfidence,
  calculateApplianceCostRp,
  calculateApplianceKwh,
  calculateCostRp,
  estimate,
  roundKwh,
  roundRp,
} from './index';

const window = {
  from: '2026-12-01T06:00:00+07:00',
  to: '2026-12-02T06:00:00+07:00',
};

function input(overrides: Partial<EstimateInput> = {}): EstimateInput {
  return {
    window,
    appliances: [{ appliance_id: 'dryer', power_kw: 3, hours: 5, load_factor: 0.7 }],
    meter_delta_kwh: 28,
    engine_version: 'input-version-diabaikan',
    ...overrides,
  };
}

describe('calculateApplianceKwh', () => {
  it('matches the PRD 8.9 dryer example', () => {
    expect(calculateApplianceKwh(3, 5, 0.7)).toBeCloseTo(10.5, 10);
  });

  it('rejects negative values and load factor above 1', () => {
    expect(() => calculateApplianceKwh(-1, 2, 0.5)).toThrow(RangeError);
    expect(() => calculateApplianceKwh(1, -2, 0.5)).toThrow(RangeError);
    expect(() => calculateApplianceKwh(1, 2, 1.2)).toThrow(RangeError);
  });
});

describe('cost and rounding', () => {
  it('calculates Rupiah from kWh and tariff input', () => {
    expect(calculateCostRp(10.5, 1444.7)).toBe(15169);
    expect(calculateCostRp(0, 1444.7)).toBe(0);
  });

  it('calculates appliance cost without duplicating the formula', () => {
    const appliance = { appliance_id: 'dryer', power_kw: 3, hours: 5, load_factor: 0.7 };

    expect(calculateApplianceCostRp(appliance, 1444.7)).toBe(15169);
  });

  it('rounds kWh and Rupiah using engine config', () => {
    expect(roundKwh(1.23456)).toBe(1.23);
    expect(roundRp(15169.35)).toBe(15169);
    expect(ENERGY_CALC_CONFIG.kwhDecimals).toBe(2);
    expect(ENERGY_CALC_CONFIG.rpDecimals).toBe(0);
  });

  it('rejects negative kWh, tariff, and Rupiah', () => {
    expect(() => calculateCostRp(-1, 1000)).toThrow(RangeError);
    expect(() => calculateCostRp(1, -1000)).toThrow(RangeError);
    expect(() => roundKwh(-1)).toThrow(RangeError);
    expect(() => roundRp(-1)).toThrow(RangeError);
  });
});

describe('assessConfidence', () => {
  it('maps gap thresholds to C6 levels', () => {
    expect(assessConfidence(0.15, 7).level).toBe('high');
    expect(assessConfidence(0.16, 7).level).toBe('medium');
    expect(assessConfidence(0.35, 7).level).toBe('medium');
    expect(assessConfidence(0.36, 7).level).toBe('low');
    expect(assessConfidence(0.36, 7).displayLevel).toBe('category');
  });

  it('returns insufficient_data below the minimum data days', () => {
    const result = assessConfidence(0.01, 2);

    expect(result.level).toBe('low');
    expect(result.displayLevel).toBe('insufficient_data');
  });

  it('lowers confidence for a negative gap', () => {
    expect(assessConfidence(0.25, 7, true).level).toBe('low');
  });
});

describe('estimate', () => {
  it('matches the PRD 8.9 first-pass example', () => {
    const result = estimate(input());

    expect(result.explained_kwh).toBe(10.5);
    expect(result.unexplained_kwh).toBe(17.5);
    expect(result.gap_ratio).toBeCloseTo(0.625, 10);
    expect(result.overall_confidence).toBe('low');
    expect(result.display_level).toBe('category');
    expect(result.next_questions?.length).toBeGreaterThan(0);
    expect(result.suggested_missions).toEqual(['M1', 'M3', 'M4']);
    expect(result.engine_version).toBe(ENGINE_VERSION);
    expect(result.per_appliance[0]?.basis).toEqual({
      power_kw: 3,
      hours: 5,
      load_factor: 0.7,
    });
  });

  it('matches the PRD 8.9 follow-up example after confirming fridge and iron', () => {
    const result = estimate(
      input({
        appliances: [
          { appliance_id: 'dryer', power_kw: 3, hours: 5, load_factor: 0.7 },
          { appliance_id: 'fridge', power_kw: 0.15, hours: 24, load_factor: 0.4 },
          { appliance_id: 'iron', power_kw: 1, hours: 2, load_factor: 0.8 },
        ],
      }),
    );

    expect(result.per_appliance.map((item) => item.kwh)).toEqual([10.5, 1.44, 1.6]);
    expect(result.explained_kwh).toBe(13.54);
    expect(result.unexplained_kwh).toBeCloseTo(14.5, 1);
    expect(result.overall_confidence).toBe('low');
  });

  it('returns high confidence when the meter gap is small', () => {
    const result = estimate(input({ meter_delta_kwh: 12 }));

    expect(result.unexplained_kwh).toBe(1.5);
    expect(result.gap_ratio).toBeCloseTo(0.125, 10);
    expect(result.overall_confidence).toBe('high');
    expect(result.display_level).toBe('appliance');
  });

  it('returns medium confidence for a medium gap', () => {
    const result = estimate(input({ meter_delta_kwh: 14 }));

    expect(result.gap_ratio).toBeCloseTo(0.25, 10);
    expect(result.overall_confidence).toBe('medium');
    expect(result.display_level).toBe('appliance');
  });

  it('marks data below three days as insufficient', () => {
    const result = estimate(input({ meter_delta_kwh: 12, data_days: 2 }));

    expect(result.overall_confidence).toBe('low');
    expect(result.display_level).toBe('insufficient_data');
    expect(result.suggested_missions).toEqual(['M2']);
  });

  it('does not allocate a negative gap to appliances', () => {
    const result = estimate(input({ meter_delta_kwh: 8 }));

    expect(result.unexplained_kwh).toBe(0);
    expect(result.overall_confidence).toBe('low');
    expect(result.display_level).toBe('category');
  });

  it('works without a meter reading but stays at medium confidence', () => {
    const result = estimate({
      window,
      appliances: [{ appliance_id: 'dryer', power_kw: 3, hours: 5, load_factor: 0.7 }],
      engine_version: 'ignored',
    });

    expect(result.meter_delta_kwh).toBeNull();
    expect(result.unexplained_kwh).toBeNull();
    expect(result.gap_ratio).toBeNull();
    expect(result.overall_confidence).toBe('medium');
    expect(result.display_level).toBe('appliance');
  });

  it('throws for an empty appliance list or invalid data days', () => {
    expect(() => estimate(input({ appliances: [] }))).toThrow(RangeError);
    expect(() => estimate(input({ data_days: -1 }))).toThrow(RangeError);
  });

  it('ignores the input engine_version and stamps the engine version', () => {
    const result = estimate(input({ engine_version: 'manual-input' }));

    expect(result.engine_version).toBe(ENGINE_VERSION);
  });
});
