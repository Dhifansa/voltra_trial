/**
 * Model game Kios Virtual — murni (tanpa DOM), sesuai ADR-004.
 * Semua kWh/Rp berasal dari `@voltra/energy-calc`; renderer hanya menampilkan.
 */
import type { KiosTemplate, TemplateAppliance } from '@voltra/contracts';
import { calculateApplianceKwh, calculateCostRp } from '@voltra/energy-calc';
import { SIM_TARIFF } from './templates';

export interface KiosSlot {
  /** id unik slot (alat yang sama boleh ditambah dua kali di Kustom). */
  uid: string;
  appliance: TemplateAppliance;
  hours: number;
  on: boolean;
}

export interface KiosState {
  templateId: string;
  templateVersion: string;
  shopName: string;
  slots: KiosSlot[];
}

export type KiosMood = 'hemat' | 'normal' | 'boros';

export interface SlotResult {
  uid: string;
  kwh: number;
  rp_day: number;
  rp_hour: number;
}

export interface KiosResult {
  per_slot: Record<string, SlotResult>;
  kwh_day: number;
  rp_day: number;
}

/** Target tantangan PRD 2 §5: turunkan tagihan 10%. */
export const CHALLENGE_TARGET = 0.1;

export function createState(template: KiosTemplate, shopName: string): KiosState {
  return {
    templateId: template.template_id,
    templateVersion: template.version,
    shopName,
    slots: template.appliances.map((a, i) => ({
      uid: `${a.id}-${i}`,
      appliance: a,
      hours: a.usage_pattern.hours_per_day.typical,
      on: true,
    })),
  };
}

export function addSlot(state: KiosState, appliance: TemplateAppliance): KiosState {
  const uid = `${appliance.id}-${Date.now().toString(36)}`;
  return {
    ...state,
    slots: [...state.slots, { uid, appliance, hours: appliance.usage_pattern.hours_per_day.typical, on: true }],
  };
}

export function removeSlot(state: KiosState, uid: string): KiosState {
  return { ...state, slots: state.slots.filter((s) => s.uid !== uid) };
}

/** Batas jam: alat kritis tidak boleh di bawah jam minimum (cegah solusi "matikan semua"). */
export function hourBounds(a: TemplateAppliance): { min: number; max: number } {
  const p = a.usage_pattern.hours_per_day;
  if (a.usage_pattern.always_on) return { min: 24, max: 24 };
  return { min: a.critical ? p.min : 0, max: Math.max(p.max, 1) };
}

export function setHours(state: KiosState, uid: string, hours: number): KiosState {
  return {
    ...state,
    slots: state.slots.map((s) => {
      if (s.uid !== uid) return s;
      const b = hourBounds(s.appliance);
      return { ...s, hours: Math.min(b.max, Math.max(b.min, hours)) };
    }),
  };
}

export function toggleSlot(state: KiosState, uid: string): KiosState {
  return {
    ...state,
    slots: state.slots.map((s) => (s.uid === uid && !s.appliance.critical ? { ...s, on: !s.on } : s)),
  };
}

function powerKw(a: TemplateAppliance) {
  return a.power_w.typical / 1000;
}

export function compute(state: KiosState, tariff = SIM_TARIFF.rp_per_kwh): KiosResult {
  const per_slot: Record<string, SlotResult> = {};
  let kwhDay = 0;
  for (const s of state.slots) {
    const kw = powerKw(s.appliance);
    const lf = s.appliance.load_factor.typical;
    const kwh = s.on ? calculateApplianceKwh(kw, s.hours, lf) : 0;
    kwhDay += kwh;
    per_slot[s.uid] = {
      uid: s.uid,
      kwh,
      rp_day: calculateCostRp(kwh, tariff),
      rp_hour: calculateCostRp(calculateApplianceKwh(kw, 1, lf), tariff),
    };
  }
  return {
    per_slot,
    kwh_day: kwhDay,
    rp_day: calculateCostRp(kwhDay, tariff),
  };
}

export function moodOf(current: number, baseline: number): KiosMood {
  if (baseline <= 0) return 'normal';
  const change = (baseline - current) / baseline;
  if (change >= CHALLENGE_TARGET) return 'hemat';
  if (change <= -0.05) return 'boros';
  return 'normal';
}

/** Progres tantangan 0..1 terhadap target 10%. */
export function challengeProgress(current: number, baseline: number): number {
  if (baseline <= 0) return 0;
  const change = (baseline - current) / baseline;
  return Math.max(0, Math.min(1, change / CHALLENGE_TARGET));
}

export function topSlot(state: KiosState, result: KiosResult): KiosSlot | undefined {
  return [...state.slots].sort((a, b) => (result.per_slot[b.uid]?.kwh ?? 0) - (result.per_slot[a.uid]?.kwh ?? 0))[0];
}
