'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ApplianceCategory,
  OcrLabelResponse,
  Recommendation,
  SttExtractResponse,
  TemplateAppliance,
} from '@voltra/contracts';
import { calculateApplianceKwh, calculateCostRp, estimate } from '@voltra/energy-calc';
import {
  addSlot,
  compute,
  createState,
  type KiosResult,
  type KiosState,
} from '@/features/kios/model';
import {
  SIM_TARIFF,
  getTariff,
  getTemplate,
} from '@/features/kios/templates';
import {
  CATEGORY_LABEL,
  type CostRow,
  type CostScenario,
  type ScenarioId,
} from '@/lib/mock-data';

export interface UserSession {
  userId: string;
  ownerName: string;
  phone: string;
  email?: string;
  authMethod?: 'whatsapp' | 'google' | 'email' | 'guest';
  role: 'guest' | 'user';
  consentVersion: string;
  onboarded: boolean;
  homeTutorialDone?: boolean;
  kiosTutorialDone?: boolean;
}

export interface BusinessProfileState {
  businessId: string;
  businessName: string;
  templateId: string;
  tariffId: string;
  tariffName: string;
  tariffRpPerKwh: number;
  billingType: 'prepaid' | 'postpaid';
  unitLabel: string;
  dailyVolume: number;
  address: string;
  dataDays: number;
  recordCount?: number;
  trialDaysLeft: number;
  subscriptionPlan: 'free' | 'plus';
  subscriptionStatus: 'trial' | 'active' | 'pending' | 'expired';
}

export interface AppSettings {
  waReminder: boolean;
  reminderTime: string;
  aiMode: 'mock' | 'hybrid';
  reducedMotion: boolean;
  language: 'id' | 'en';
}

export interface WeeklySavingReport {
  weekNumber: number;
  grade: 'A' | 'B+' | 'B' | 'C';
  efficiencyPct: number;
  totalKwh: number;
  totalRp: number;
  savedKwh: number;
  savedRp: number;
  bestAppliance: string;
  wastefulAppliance: string;
  generatedAt: string;
}

export interface GameCycleState {
  currentDay: number; // 1 s/d 7
  totalDaysCompleted: number;
  weeklyReportUnlocked: boolean;
  weeklyReport?: WeeklySavingReport;
}

interface StoredAppState {
  user: UserSession;
  profile: BusinessProfileState;
  kios: KiosState;
  kiosBaselineRp: number;
  settings: AppSettings;
  gameCycle: GameCycleState;
}

export interface DerivedAnalytics {
  kiosResult: KiosResult;
  scenarios: Record<ScenarioId, CostScenario>;
  week: Array<{ day: string; kwh: number; rp: number }>;
  recommendations: Recommendation[];
  ocrLabelExamples: Record<'success' | 'low_confidence', OcrLabelResponse>;
  sttExample: SttExtractResponse;
  voicePromptExample: string;
}

interface VoltraAppContextValue extends StoredAppState {
  hydrated: boolean;
  analytics: DerivedAnalytics;
  loginWithOtp: (payload: { phone: string; ownerName: string; email?: string }) => void;
  loginWithGoogle: (payload?: { ownerName?: string; email?: string }) => void;
  registerAccount: (payload: { ownerName: string; email: string; phone: string }) => void;
  continueAsGuest: (ownerName?: string) => void;
  logout: () => void;
  saveProfiling: (input: {
    businessName: string;
    templateId: string;
    tariffId: string;
    billingType: 'prepaid' | 'postpaid';
    dailyVolume: number;
    address?: string;
    subscriptionPlan?: 'free' | 'plus';
  }) => void;
  updateProfile: (patch: Partial<BusinessProfileState>) => void;
  recordDataUpdate: (type: 'meter' | 'label' | 'voice' | 'manual', detail?: string) => void;
  advanceGameDay: () => { completedWeek: boolean; newDay: number; report?: WeeklySavingReport };
  resetGameWeek: () => void;
  selectTemplate: (templateId: string, customShopName?: string) => void;
  updateKios: (next: KiosState, rebase?: boolean) => void;
  addCustomAppliance: (name: string, watt: number) => void;
  applyVoiceHours: (hoursMap: Record<string, number>, volume?: number) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  completeHomeTutorial: () => void;
  completeKiosTutorial: () => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'voltra.app.v2';
const LEGACY_KIOS_KEY = 'voltra.kios.v1';

function buildDefaultState(): StoredAppState {
  const tpl = getTemplate('laundry');
  const tariff = getTariff('rate_b1_2200');
  const shopName = 'Laundry Bu Sari';
  const kios = createState(tpl, shopName);
  const kiosBaselineRp = compute(kios, tariff.rate).rp_day;

  return {
    user: {
      userId: 'usr_demo_01',
      ownerName: 'Bu Sari',
      phone: '+62 812-3456-7890',
      email: 'busari.umkm@gmail.com',
      authMethod: 'guest',
      role: 'guest',
      consentVersion: 'v1.0',
      onboarded: false,
      homeTutorialDone: false,
      kiosTutorialDone: false,
    },
    profile: {
      businessId: 'biz_demo_01',
      businessName: shopName,
      templateId: tpl.template_id,
      tariffId: tariff.id,
      tariffName: tariff.name,
      tariffRpPerKwh: tariff.rate,
      billingType: 'prepaid',
      unitLabel: tpl.unit.label,
      dailyVolume: tpl.unit.default_daily,
      address: 'Sekaran, Gunungpati, Semarang',
      dataDays: 1,
      recordCount: 1,
      trialDaysLeft: 30,
      subscriptionPlan: 'free',
      subscriptionStatus: 'trial',
    },
    kios,
    kiosBaselineRp,
    settings: {
      waReminder: true,
      reminderTime: '20:30',
      aiMode: 'mock',
      reducedMotion: false,
      language: 'id',
    },
    gameCycle: {
      currentDay: 1,
      totalDaysCompleted: 0,
      weeklyReportUnlocked: false,
    },
  };
}

const WINDOW = {
  from: '2026-11-05T06:00:00+07:00',
  to: '2026-11-06T06:00:00+07:00',
};

function computeAnalytics(state: StoredAppState): DerivedAnalytics {
  const { profile, kios } = state;
  const tariff = profile.tariffRpPerKwh || SIM_TARIFF.rp_per_kwh;
  const tpl = getTemplate(profile.templateId);
  const kiosResult = compute(kios, tariff);

  // Gunakan slot aktif; bila semua dimatikan, fallback ke slot pertama agar estimate() tidak error
  const activeSlots = kios.slots.filter((s) => s.on && s.hours > 0);
  const sourceSlots = activeSlots.length > 0 ? activeSlots : kios.slots.slice(0, 1);

  const applianceInputs = sourceSlots.map((s) => ({
    uid: s.uid,
    id: s.appliance.id,
    name: s.appliance.name,
    category: s.appliance.category,
    power_kw: Math.max(0.01, s.appliance.power_w.typical / 1000),
    hours: Math.max(0.5, s.hours),
    load_factor: s.appliance.load_factor.typical,
  }));

  const explainedSum = applianceInputs.reduce(
    (acc, a) => acc + calculateApplianceKwh(a.power_kw, a.hours, a.load_factor),
    0,
  );

  const rp = (kwh: number) => calculateCostRp(kwh, tariff);

  function buildScenario(
    id: ScenarioId,
    label: string,
    hint: string,
    meterMultiplier: number,
    days: number,
  ): CostScenario {
    const meterDelta = Math.max(0.5, Number((explainedSum * meterMultiplier).toFixed(2)));
    const result = estimate({
      window: WINDOW,
      appliances: applianceInputs.map((a) => ({
        appliance_id: a.uid,
        power_kw: a.power_kw,
        hours: a.hours,
        load_factor: a.load_factor,
      })),
      meter_delta_kwh: meterDelta,
      data_days: days,
      engine_version: '0.1.0',
    });

    const meterKwh = result.meter_delta_kwh ?? result.explained_kwh;
    const share = (kwh: number) => (meterKwh > 0 ? kwh / meterKwh : 0);
    const metaByUid = new Map(applianceInputs.map((a) => [a.uid, a]));

    let rows: CostRow[] = [];
    if (result.display_level === 'appliance') {
      rows = result.per_appliance
        .map((a) => {
          const meta = metaByUid.get(a.appliance_id);
          return {
            id: a.appliance_id,
            label: meta?.name ?? a.appliance_id,
            kwh: a.kwh,
            rp: rp(a.kwh),
            share: share(a.kwh),
            basis: `${a.basis.power_kw} kW × ${a.basis.hours} jam × faktor ${a.basis.load_factor}`,
          };
        })
        .sort((x, y) => y.kwh - x.kwh);
    } else if (result.display_level === 'category') {
      const grouped = new Map<ApplianceCategory, number>();
      for (const a of result.per_appliance) {
        const cat = metaByUid.get(a.appliance_id)?.category ?? 'other';
        grouped.set(cat, (grouped.get(cat) ?? 0) + a.kwh);
      }
      rows = [...grouped.entries()]
        .map(([cat, kwh]) => ({
          id: cat,
          label: CATEGORY_LABEL[cat],
          kwh,
          rp: rp(kwh),
          share: share(kwh),
        }))
        .sort((x, y) => y.kwh - x.kwh);
    }

    const insufficient = result.display_level === 'insufficient_data';
    const volume = Math.max(1, profile.dailyVolume);
    return {
      id,
      label,
      hint,
      result,
      display_level: result.display_level,
      confidence: result.overall_confidence,
      total_rp: insufficient ? null : rp(meterKwh),
      unexplained_rp:
        insufficient || result.unexplained_kwh === null ? null : rp(result.unexplained_kwh),
      per_unit_rp: insufficient ? null : rp(meterKwh / volume),
      rows,
    };
  }

  const isUnlocked = (profile.recordCount ?? 1) >= 2;
  const effectiveDays = isUnlocked ? Math.max(3, profile.dataDays || 3) : 1;

  const scenarios: Record<ScenarioId, CostScenario> = {
    appliance: buildScenario(
      'appliance',
      'Data cukup',
      `Selisih meter kecil, rincian per alat ${tpl.display_name} tampil`,
      1.09,
      effectiveDays,
    ),
    category: buildScenario(
      'category',
      'Selisih besar',
      'Turun ke tampilan kelompok alat',
      1.55,
      effectiveDays,
    ),
    insufficient: buildScenario(
      'insufficient',
      'Data < 3 hari',
      'Tampil "belum cukup data"',
      1.09,
      1,
    ),
  };

  // Grafik 7 hari proporsional terhadap pemakaian kios saat ini
  const baseKwh = scenarios.appliance.result.meter_delta_kwh ?? Math.max(5, explainedSum);
  const weekFactors = [0.92, 1.08, 1.24, 0.65, 0.98, 1.04, 1.0];
  const weekDays = ['Kam', 'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab'];
  const week = weekDays.map((day, idx) => {
    const kwh = Number((baseKwh * (weekFactors[idx] ?? 1)).toFixed(1));
    return { day, kwh, rp: rp(kwh) };
  });

  // Rekomendasi penghematan sesuai template & alat di kios
  const topRows = scenarios.appliance.rows;
  const recommendations: Recommendation[] = tpl.savings_actions.map((act, idx) => {
    const matchedSlot = applianceInputs.find((a) => act.applies_to.includes(a.id)) ?? applianceInputs[0];
    const targetKwh = matchedSlot
      ? calculateApplianceKwh(matchedSlot.power_kw, matchedSlot.hours, matchedSlot.load_factor)
      : Math.max(2, explainedSum * 0.3);
    const minKwh = Math.max(0.2, Number((targetKwh * 0.1).toFixed(2)));
    const maxKwh = Math.max(minKwh + 0.2, Number((targetKwh * 0.22).toFixed(2)));
    return {
      action_id: act.id,
      title: act.title,
      est_saving_kwh: { min: minKwh, max: maxKwh },
      est_saving_rp: {
        min: Math.max(500, rp(minKwh)),
        max: Math.max(1000, rp(maxKwh)),
      },
      confidence: idx === 0 ? 'high' : 'medium',
      effort: act.effort,
      score: Number((0.88 - idx * 0.14).toFixed(2)),
      safety_note: act.safety_note,
    };
  });

  if (recommendations.length === 0 && topRows[0]) {
    const r0 = topRows[0];
    const minKwh = Math.max(0.2, Number((r0.kwh * 0.1).toFixed(2)));
    const maxKwh = Math.max(0.4, Number((r0.kwh * 0.2).toFixed(2)));
    recommendations.push({
      action_id: 'custom_top_saving',
      title: `Kurangi 1 jam pemakaian ${r0.label.toLowerCase()} saat jam sepi`,
      est_saving_kwh: { min: minKwh, max: maxKwh },
      est_saving_rp: { min: Math.max(500, rp(minKwh)), max: Math.max(1000, rp(maxKwh)) },
      confidence: 'medium',
      effort: 'low',
      score: 0.8,
    });
  }

  // Contoh OCR Label & STT mengikuti alat di template aktif
  const primaryApp = tpl.appliances[0] ?? getTemplate('laundry').appliances[0]!;
  const secondaryApp = tpl.appliances[1] ?? primaryApp;

  const ocrLabelExamples: Record<'success' | 'low_confidence', OcrLabelResponse> = {
    success: {
      request_id: 'r_ocr_label_success_001',
      engine_version: 'ocr-label-0.1.0',
      mode: 'mock',
      confidence: 'high',
      warnings: [],
      name: secondaryApp.name,
      brand: 'Contoh Merek',
      power_w: secondaryApp.power_w.typical,
      needs_retake: false,
    },
    low_confidence: {
      request_id: 'r_ocr_label_low_002',
      engine_version: 'ocr-label-0.1.0',
      mode: 'mock',
      confidence: 'low',
      warnings: ['power_unit_uncertain'],
      name: primaryApp.name,
      power_w: primaryApp.power_w.min,
      needs_retake: true,
    },
  };

  const sttSlots = applianceInputs.slice(0, 2);
  const s1 = sttSlots[0];
  const s2 = sttSlots[1];
  const unitShort = profile.unitLabel.split(' ')[0] ?? 'unit';

  const transcript = s1 && s2
    ? `Hari ini target ${profile.dailyVolume} ${profile.unitLabel}, ${s1.name.toLowerCase()} nyala ${s1.hours} jam dan ${s2.name.toLowerCase()} sekitar ${s2.hours} jam.`
    : `Hari ini produksi ${profile.dailyVolume} ${profile.unitLabel}, ${primaryApp.name.toLowerCase()} nyala ${primaryApp.usage_pattern.hours_per_day.typical} jam.`;

  const confirmText = s1 && s2
    ? `${s1.name} ${s1.hours} jam, ${s2.name} ${s2.hours} jam, volume ${profile.dailyVolume} ${unitShort}. Sudah benar?`
    : `${primaryApp.name} ${primaryApp.usage_pattern.hours_per_day.typical} jam, volume ${profile.dailyVolume} ${unitShort}. Sudah benar?`;

  const sttExample: SttExtractResponse = {
    request_id: 'r_stt_success_001',
    engine_version: 'stt-extract-0.1.0',
    mode: 'mock',
    confidence: 'medium',
    warnings: [],
    transcript,
    entries: sttSlots.map((s, idx) => ({
      appliance_id: s.uid,
      hours: s.hours,
      from: idx === 0 ? '08:00' : undefined,
      to: idx === 0 ? `${String(Math.min(22, 8 + Math.round(s.hours))).padStart(2, '0')}:00` : undefined,
      conf: idx === 0 ? 0.88 : 0.76,
    })),
    work_volume: { value: profile.dailyVolume, unit: unitShort, conf: 0.9 },
    confirm_text: confirmText,
    unmatched_terms: [],
  };

  const voicePromptExample = s1 && s2
    ? `Contoh: “${s1.name} nyala ${s1.hours} jam, ${s2.name.toLowerCase()} sekitar ${s2.hours} jam, total ${profile.dailyVolume} ${profile.unitLabel}.”`
    : `Contoh: “${primaryApp.name} nyala ${primaryApp.usage_pattern.hours_per_day.typical} jam, total ${profile.dailyVolume} ${profile.unitLabel}.”`;

  return {
    kiosResult,
    scenarios,
    week,
    recommendations,
    ocrLabelExamples,
    sttExample,
    voicePromptExample,
  };
}

const VoltraAppContext = createContext<VoltraAppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredAppState>(buildDefaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredAppState>;
        setState((prev) => ({
          user: { ...prev.user, ...parsed.user },
          profile: {
            ...prev.profile,
            ...parsed.profile,
            subscriptionPlan: parsed.profile?.subscriptionPlan || prev.profile.subscriptionPlan || 'free',
            subscriptionStatus:
              parsed.profile?.subscriptionStatus ||
              (parsed.profile?.subscriptionPlan === 'plus' ? 'active' : 'trial'),
            trialDaysLeft: parsed.profile?.trialDaysLeft ?? 30,
          },
          kios: parsed.kios ?? prev.kios,
          kiosBaselineRp: parsed.kiosBaselineRp ?? prev.kiosBaselineRp,
          settings: { ...prev.settings, ...parsed.settings },
          gameCycle: parsed.gameCycle ?? prev.gameCycle,
        }));
      } else {
        // Migrasi dari key lama jika ada
        const legacyRaw = localStorage.getItem(LEGACY_KIOS_KEY);
        if (legacyRaw) {
          const legacy = JSON.parse(legacyRaw) as { state?: KiosState; baseline?: number };
          if (legacy.state) {
            const tpl = getTemplate(legacy.state.templateId);
            setState((prev) => ({
              ...prev,
              profile: {
                ...prev.profile,
                businessName: legacy.state!.shopName || tpl.display_name,
                templateId: tpl.template_id,
                unitLabel: tpl.unit.label,
                dailyVolume: tpl.unit.default_daily,
              },
              kios: legacy.state!,
              kiosBaselineRp: legacy.baseline ?? prev.kiosBaselineRp,
            }));
          }
        }
      }
    } catch {
      /* abaikan data localStorage yang rusak */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* abaikan quota error */
    }
  }, [state, hydrated]);

  const analytics = useMemo(() => computeAnalytics(state), [state]);

  function loginWithOtp({
    phone,
    ownerName,
    email,
  }: {
    phone: string;
    ownerName: string;
    email?: string;
  }) {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        phone: phone.trim() || prev.user.phone,
        ownerName: ownerName.trim() || prev.user.ownerName,
        email: email?.trim() || prev.user.email,
        authMethod: prev.user.authMethod === 'google' ? 'google' : 'whatsapp',
        role: 'user',
        consentVersion: 'v1.0',
      },
    }));
  }

  function loginWithGoogle(payload?: { ownerName?: string; email?: string }) {
    setState((prev) => {
      const name = payload?.ownerName?.trim() || prev.user.ownerName || 'Bu Sari';
      const email =
        payload?.email?.trim() ||
        prev.user.email ||
        `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'umkm'}@gmail.com`;
      return {
        ...prev,
        user: {
          ...prev.user,
          ownerName: name,
          email,
          authMethod: 'google',
          role: 'user',
          consentVersion: 'v1.0',
        },
      };
    });
  }

  function registerAccount({
    ownerName,
    email,
    phone,
  }: {
    ownerName: string;
    email: string;
    phone: string;
  }) {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ownerName: ownerName.trim() || prev.user.ownerName,
        email: email.trim() || prev.user.email,
        phone: phone.trim() || prev.user.phone,
        authMethod: 'email',
        role: 'user',
        consentVersion: 'v1.0',
      },
    }));
  }

  function continueAsGuest(ownerName?: string) {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ownerName: ownerName?.trim() || prev.user.ownerName || 'Pemilik Usaha',
        authMethod: 'guest',
        role: 'guest',
      },
    }));
  }

  function logout() {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        role: 'guest',
        onboarded: false,
        homeTutorialDone: false,
        kiosTutorialDone: false,
      },
    }));
  }

  function saveProfiling(input: {
    businessName: string;
    templateId: string;
    tariffId: string;
    billingType: 'prepaid' | 'postpaid';
    dailyVolume: number;
    address?: string;
    subscriptionPlan?: 'free' | 'plus';
  }) {
    const tpl = getTemplate(input.templateId);
    const tariff = getTariff(input.tariffId);
    const shopName = input.businessName.trim() || `${tpl.display_name} ${state.user.ownerName}`;
    const newKios = createState(tpl, shopName);
    const baseline = compute(newKios, tariff.rate).rp_day;
    const plan = input.subscriptionPlan || 'free';
    const isPlus = plan === 'plus';

    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        onboarded: true,
        homeTutorialDone: true,
        kiosTutorialDone: false,
      },
      profile: {
        ...prev.profile,
        businessName: shopName,
        templateId: tpl.template_id,
        tariffId: tariff.id,
        tariffName: tariff.name,
        tariffRpPerKwh: tariff.rate,
        billingType: input.billingType,
        unitLabel: tpl.unit.label,
        dailyVolume: Math.max(1, input.dailyVolume || tpl.unit.default_daily),
        address: input.address !== undefined ? input.address : prev.profile.address,
        dataDays: 1,
        recordCount: 1,
        subscriptionPlan: plan,
        subscriptionStatus: isPlus ? 'active' : 'trial',
        trialDaysLeft: isPlus ? 365 : 30,
      },
      kios: newKios,
      kiosBaselineRp: baseline,
    }));
  }

  function updateProfile(patch: Partial<BusinessProfileState>) {
    setState((prev) => {
      const nextProfile = { ...prev.profile, ...patch };
      if (patch.tariffId) {
        const t = getTariff(patch.tariffId);
        nextProfile.tariffName = t.name;
        nextProfile.tariffRpPerKwh = t.rate;
      }
      let nextKios = prev.kios;
      let nextBaseline = prev.kiosBaselineRp;

      if (patch.templateId && patch.templateId !== prev.profile.templateId) {
        const tpl = getTemplate(patch.templateId);
        nextProfile.unitLabel = tpl.unit.label;
        if (!patch.dailyVolume) nextProfile.dailyVolume = tpl.unit.default_daily;
        nextKios = createState(tpl, nextProfile.businessName);
        nextBaseline = compute(nextKios, nextProfile.tariffRpPerKwh).rp_day;
      } else if (patch.businessName && patch.businessName !== prev.profile.businessName) {
        nextKios = { ...prev.kios, shopName: patch.businessName };
      }

      return {
        ...prev,
        profile: nextProfile,
        kios: nextKios,
        kiosBaselineRp: nextBaseline,
      };
    });
  }

  function recordDataUpdate(_type: 'meter' | 'label' | 'voice' | 'manual', _detail?: string) {
    setState((prev) => {
      const currentCount = prev.profile.recordCount ?? 1;
      const nextCount = currentCount + 1;
      const nextDataDays = nextCount >= 2 ? Math.max(3, prev.profile.dataDays || 3) : 1;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          recordCount: nextCount,
          dataDays: nextDataDays,
        },
      };
    });
  }

  function advanceGameDay(): { completedWeek: boolean; newDay: number; report?: WeeklySavingReport } {
    let result: { completedWeek: boolean; newDay: number; report?: WeeklySavingReport } = {
      completedWeek: false,
      newDay: 1,
    };

    setState((prev) => {
      const curDay = prev.gameCycle.currentDay;
      const willComplete = curDay >= 6; // Menuju atau mencapai hari 7
      const nextDay = curDay >= 7 ? 7 : curDay + 1;
      const nextDataDays = Math.max(prev.profile.dataDays, Math.min(7, nextDay));

      let report = prev.gameCycle.weeklyReport;
      if (curDay >= 6 || nextDay >= 7) {
        const topApp = prev.kios.slots.slice().sort((a, b) => (b.hours * b.appliance.power_w.typical) - (a.hours * a.appliance.power_w.typical))[0];
        const efficientApp = prev.kios.slots.find((s) => s.on && s.hours <= 5) || prev.kios.slots[0];
        const dailyKwh = prev.kios.slots.reduce(
          (acc, s) => acc + (s.on ? (s.appliance.power_w.typical / 1000) * s.hours * s.appliance.load_factor.typical : 0),
          0,
        );
        const totalKwh = Number((dailyKwh * 7).toFixed(1));
        const tariff = prev.profile.tariffRpPerKwh || 1444.7;
        const totalRp = Math.round(totalKwh * tariff);
        const baselineTotalRp = Math.round(prev.kiosBaselineRp * 7);
        const savedRp = Math.max(28500, baselineTotalRp - totalRp);
        const savedKwh = Number((savedRp / tariff).toFixed(1));

        report = {
          weekNumber: Math.floor(prev.gameCycle.totalDaysCompleted / 7) + 1,
          grade: savedRp >= 25000 ? 'A' : 'B+',
          efficiencyPct: Math.min(94, Math.max(83, Math.round(85 + (savedRp / 12000)))),
          totalKwh,
          totalRp,
          savedKwh,
          savedRp,
          bestAppliance: efficientApp?.appliance.name || 'Mesin Cuci Front Loading',
          wastefulAppliance: topApp?.appliance.name || 'Pengering Heavy Duty',
          generatedAt: new Date().toLocaleDateString('id-ID', { dateStyle: 'full' }),
        };
      }

      result = {
        completedWeek: nextDay >= 7,
        newDay: nextDay,
        report,
      };

      return {
        ...prev,
        profile: {
          ...prev.profile,
          dataDays: nextDataDays,
          recordCount: Math.max(prev.profile.recordCount || 1, nextDay >= 2 ? 2 : 1),
        },
        gameCycle: {
          currentDay: nextDay,
          totalDaysCompleted: prev.gameCycle.totalDaysCompleted + 1,
          weeklyReportUnlocked: nextDay >= 7 || prev.gameCycle.weeklyReportUnlocked,
          weeklyReport: report,
        },
      };
    });

    return result;
  }

  function resetGameWeek() {
    setState((prev) => ({
      ...prev,
      gameCycle: {
        currentDay: 1,
        totalDaysCompleted: prev.gameCycle.totalDaysCompleted,
        weeklyReportUnlocked: false,
        weeklyReport: undefined,
      },
    }));
  }

  function selectTemplate(templateId: string, customShopName?: string) {
    const tpl = getTemplate(templateId);
    setState((prev) => {
      const shopName = customShopName?.trim() || prev.profile.businessName || tpl.display_name;
      const nextKios = createState(tpl, shopName);
      const nextBaseline = compute(nextKios, prev.profile.tariffRpPerKwh).rp_day;
      return {
        ...prev,
        user: { ...prev.user, onboarded: true, homeTutorialDone: true, kiosTutorialDone: false },
        profile: {
          ...prev.profile,
          businessName: shopName,
          templateId: tpl.template_id,
          unitLabel: tpl.unit.label,
          dailyVolume: tpl.unit.default_daily,
        },
        kios: nextKios,
        kiosBaselineRp: nextBaseline,
      };
    });
  }

  function updateKios(next: KiosState, rebase = false) {
    setState((prev) => ({
      ...prev,
      kios: next,
      kiosBaselineRp: rebase
        ? compute(next, prev.profile.tariffRpPerKwh).rp_day
        : prev.kiosBaselineRp,
    }));
  }

  function addCustomAppliance(name: string, watt: number) {
    const cleanWatt = Math.max(10, Number(watt) || 250);
    const customApp: TemplateAppliance = {
      id: `custom_${Date.now().toString(36)}`,
      name: name.trim() || 'Alat baru',
      icon: cleanWatt >= 1000 ? 'oven' : cleanWatt >= 300 ? 'washer' : 'lamp',
      power_w: {
        min: Math.round(cleanWatt * 0.7),
        typical: cleanWatt,
        max: Math.round(cleanWatt * 1.3),
      },
      load_factor: { typical: 0.75, range: [0.5, 0.95] },
      usage_pattern: {
        hours_per_day: { min: 1, typical: 4, max: 12 },
        always_on: false,
        peak_hours: [],
      },
      category: cleanWatt >= 1000 ? 'heater' : 'other',
      critical: false,
    };
    setState((prev) => {
      const nextKios = addSlot(prev.kios, customApp);
      return {
        ...prev,
        kios: nextKios,
        kiosBaselineRp: compute(nextKios, prev.profile.tariffRpPerKwh).rp_day,
      };
    });
  }

  function applyVoiceHours(hoursMap: Record<string, number>, volume?: number) {
    setState((prev) => {
      const nextSlots = prev.kios.slots.map((slot) => {
        const updated = hoursMap[slot.uid];
        if (updated === undefined || Number.isNaN(updated)) return slot;
        return { ...slot, hours: Math.max(0, Math.min(24, updated)), on: updated > 0 };
      });
      return {
        ...prev,
        profile: {
          ...prev.profile,
          dailyVolume: volume && volume > 0 ? volume : prev.profile.dailyVolume,
        },
        kios: { ...prev.kios, slots: nextSlots },
      };
    });
  }

  function updateSettings(patch: Partial<AppSettings>) {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }

  function completeHomeTutorial() {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, homeTutorialDone: true },
    }));
  }

  function completeKiosTutorial() {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, kiosTutorialDone: true },
    }));
  }

  function resetAllData() {
    const fresh = buildDefaultState();
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KIOS_KEY);
    } catch {
      /* ignore */
    }
    setState(fresh);
  }

  return (
    <VoltraAppContext.Provider
      value={{
        ...state,
        hydrated,
        analytics,
        loginWithOtp,
        loginWithGoogle,
        registerAccount,
        continueAsGuest,
        logout,
        saveProfiling,
        updateProfile,
        recordDataUpdate,
        advanceGameDay,
        resetGameWeek,
        selectTemplate,
        updateKios,
        addCustomAppliance,
        applyVoiceHours,
        updateSettings,
        completeHomeTutorial,
        completeKiosTutorial,
        resetAllData,
      }}
    >
      {children}
    </VoltraAppContext.Provider>
  );
}

export function useVoltraApp(): VoltraAppContextValue {
  const ctx = useContext(VoltraAppContext);
  if (!ctx) {
    throw new Error('useVoltraApp harus dipakai di dalam <AppProvider>');
  }
  return ctx;
}
