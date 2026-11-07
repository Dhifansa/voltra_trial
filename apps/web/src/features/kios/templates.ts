/**
 * Katalog template Kios Virtual (Kontrak C1 — KiosTemplate).
 *
 * Nilai daya/faktor beban/jam adalah PRIOR CONTOH untuk simulasi dan
 * wajib diverifikasi tim ke sumber resmi + pelaku usaha (PRD 2 §4).
 * Nanti katalog ini dimuat dari `packages/contracts/templates/**` / API.
 */
import type { KiosTemplate, TemplateAppliance } from '@voltra/contracts';

export interface TariffOption {
  id: string;
  name: string;
  rate: number;
  category: 'residential' | 'commercial';
  description: string;
}

export const TARIFF_OPTIONS: TariffOption[] = [
  { id: 'rate_r1_900', name: 'R-1/TR 900 VA', rate: 1352, category: 'residential', description: 'Rumah tangga 900 VA (subsidi)' },
  { id: 'rate_r1_1300', name: 'R-1/TR 1300 VA', rate: 1444.7, category: 'residential', description: 'Rumah tangga 1300 VA' },
  { id: 'rate_r1_2200', name: 'R-1/TR 2200 VA', rate: 1444.7, category: 'residential', description: 'Rumah tangga 2200 VA' },
  { id: 'rate_b1_1300', name: 'B-1/TR 1300 VA', rate: 1444.7, category: 'commercial', description: 'Bisnis 1300 VA (UMKM kecil)' },
  { id: 'rate_b1_2200', name: 'B-1/TR 2200 VA', rate: 1444.7, category: 'commercial', description: 'Bisnis 2200 VA' },
  { id: 'rate_b2_3500', name: 'B-2/TR 3500-5500 VA', rate: 1699.53, category: 'commercial', description: 'Bisnis 3500-5500 VA (UMKM sedang)' },
];

/** Tarif simulasi default (B-1/TR 2200 VA). Bisa diubah di profil/pengaturan; bukan rumus. */
export const SIM_TARIFF = { name: 'B-1/TR 2200 VA', rp_per_kwh: 1444.7 };

/** Batas jam buka kios dipakai agar tantangan tidak diselesaikan dengan "matikan semua". */
export const OPEN_HOURS = 12;

type A = Omit<TemplateAppliance, 'power_w' | 'usage_pattern' | 'load_factor'> & {
  w: [number, number, number];
  lf: number;
  h: [number, number, number];
  always_on?: boolean;
};

function appliance(a: A): TemplateAppliance {
  const { w, lf, h, always_on = false, ...rest } = a;
  return {
    ...rest,
    power_w: { min: w[0], typical: w[1], max: w[2] },
    load_factor: { typical: lf, range: [Math.max(0.1, lf - 0.2), Math.min(1, lf + 0.2)] },
    usage_pattern: {
      hours_per_day: { min: h[0], typical: h[1], max: h[2] },
      always_on,
      peak_hours: [],
    },
  };
}

export const TEMPLATES: KiosTemplate[] = [
  {
    template_id: 'laundry',
    version: '0.1.0',
    display_name: 'Laundry Kiloan',
    unit: { id: 'kg', label: 'kg cucian', default_daily: 50 },
    appliances: [
      appliance({ id: 'washer', name: 'Mesin cuci', icon: 'washer', category: 'other', critical: true, w: [300, 500, 800], lf: 0.8, h: [4, 6, 10] }),
      appliance({ id: 'dryer', name: 'Pengering', icon: 'dryer', category: 'heater', critical: false, w: [2000, 3000, 4500], lf: 0.7, h: [2, 5, 10] }),
      appliance({ id: 'iron', name: 'Setrika uap', icon: 'iron', category: 'heater', critical: false, w: [800, 1000, 1500], lf: 0.5, h: [2, 4, 8] }),
      appliance({ id: 'pump', name: 'Pompa air', icon: 'pump', category: 'other', critical: true, w: [125, 250, 400], lf: 0.8, h: [1, 3, 6] }),
      appliance({ id: 'lamp', name: 'Lampu kios', icon: 'lamp', category: 'lighting', critical: true, w: [60, 150, 300], lf: 1, h: [6, 12, 14] }),
    ],
    savings_actions: [
      { id: 'full_load_dryer', title: 'Isi pengering sampai penuh sebelum menyalakan', applies_to: ['dryer'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low', safety_note: 'Jangan melebihi kapasitas mesin.' },
      { id: 'iron_batch', title: 'Setrika sekaligus dalam satu sesi, bukan dicicil', applies_to: ['iron'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low' },
      { id: 'pump_timer', title: 'Periksa kebocoran keran & pasang otomatis pompa air', applies_to: ['pump'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'medium' },
    ],
    missions_enabled: ['M1', 'M2', 'M3', 'M4'],
  },
  {
    template_id: 'warung',
    version: '0.1.0',
    display_name: 'Rumah Makan / Warung',
    unit: { id: 'porsi', label: 'porsi', default_daily: 120 },
    appliances: [
      appliance({ id: 'freezer', name: 'Freezer', icon: 'freezer', category: 'cooling', critical: true, w: [100, 150, 250], lf: 0.45, h: [24, 24, 24], always_on: true }),
      appliance({ id: 'fridge', name: 'Kulkas', icon: 'fridge', category: 'cooling', critical: true, w: [80, 120, 200], lf: 0.45, h: [24, 24, 24], always_on: true }),
      appliance({ id: 'ricecooker', name: 'Rice cooker', icon: 'ricecooker', category: 'heater', critical: true, w: [300, 400, 700], lf: 0.35, h: [6, 10, 14] }),
      appliance({ id: 'blender', name: 'Blender', icon: 'blender', category: 'other', critical: false, w: [250, 350, 600], lf: 0.8, h: [0.5, 1, 3] }),
      appliance({ id: 'fan', name: 'Kipas angin', icon: 'fan', category: 'cooling', critical: false, w: [35, 50, 80], lf: 0.9, h: [6, 12, 14] }),
      appliance({ id: 'lamp', name: 'Lampu', icon: 'lamp', category: 'lighting', critical: true, w: [60, 120, 250], lf: 1, h: [6, 12, 14] }),
    ],
    savings_actions: [
      { id: 'freezer_door', title: 'Kurangi buka-tutup pintu freezer & bersihkan karet seal', applies_to: ['freezer', 'fridge'], saving_formula: 'reduce_load_pct * appliance_kwh', effort: 'low', safety_note: 'Pastikan suhu beku tetap terjaga.' },
      { id: 'rice_warm', title: 'Matikan mode penghangat rice cooker saat jam sepi', applies_to: ['ricecooker'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low' },
      { id: 'fan_zone', title: 'Matikan kipas di area meja yang sedang kosong', applies_to: ['fan'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low' },
    ],
    missions_enabled: ['M1', 'M2', 'M3', 'M4'],
  },
  {
    template_id: 'roti',
    version: '0.1.0',
    display_name: 'Toko Roti / Katering',
    unit: { id: 'loyang', label: 'loyang', default_daily: 30 },
    appliances: [
      appliance({ id: 'oven', name: 'Oven listrik', icon: 'oven', category: 'heater', critical: true, w: [1500, 2500, 4000], lf: 0.6, h: [2, 5, 9] }),
      appliance({ id: 'mixer', name: 'Mixer', icon: 'mixer', category: 'other', critical: true, w: [300, 500, 1000], lf: 0.7, h: [1, 3, 6] }),
      appliance({ id: 'chiller', name: 'Chiller', icon: 'fridge', category: 'cooling', critical: true, w: [150, 250, 400], lf: 0.45, h: [24, 24, 24], always_on: true }),
      appliance({ id: 'display', name: 'Display cooler', icon: 'display', category: 'cooling', critical: false, w: [200, 300, 500], lf: 0.5, h: [8, 12, 14] }),
      appliance({ id: 'lamp', name: 'Lampu', icon: 'lamp', category: 'lighting', critical: true, w: [60, 120, 250], lf: 1, h: [6, 12, 14] }),
    ],
    savings_actions: [
      { id: 'oven_batch', title: 'Panggang beruntun saat oven sudah panas agar tidak preheat berulang', applies_to: ['oven'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low', safety_note: 'Ikuti suhu resep per loyang.' },
      { id: 'display_schedule', title: 'Matikan lampu & pendingin display cooler setelah stok habis', applies_to: ['display'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low' },
      { id: 'chiller_coil', title: 'Beri jarak sirkulasi udara di belakang chiller minimal 10 cm', applies_to: ['chiller'], saving_formula: 'reduce_load_pct * appliance_kwh', effort: 'medium' },
    ],
    missions_enabled: ['M1', 'M2', 'M3', 'M4'],
  },
  {
    template_id: 'kustom',
    version: '0.1.0',
    display_name: 'Kustom',
    unit: { id: 'unit', label: 'unit usaha', default_daily: 25 },
    appliances: [
      appliance({ id: 'lamp', name: 'Lampu', icon: 'lamp', category: 'lighting', critical: true, w: [60, 120, 250], lf: 1, h: [6, 12, 14] }),
      appliance({ id: 'fan', name: 'Kipas angin', icon: 'fan', category: 'cooling', critical: false, w: [35, 50, 80], lf: 0.9, h: [6, 10, 14] }),
    ],
    savings_actions: [
      { id: 'custom_schedule', title: 'Rapikan jadwal nyala alat berdaya besar agar tidak bersamaan', applies_to: ['lamp'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low' },
      { id: 'custom_standby', title: 'Cabut alat non-wajib saat kios tutup', applies_to: ['fan'], saving_formula: 'reduce_hours_pct * appliance_kwh', effort: 'low' },
    ],
    missions_enabled: ['M1', 'M2', 'M3'],
  },
];

export const TEMPLATE_META: Record<string, { blurb: string; tag: string }> = {
  laundry: { blurb: 'Mesin cuci, pengering, setrika, pompa air', tag: 'MVP' },
  warung: { blurb: 'Freezer, kulkas, rice cooker, blender, kipas', tag: 'MVP' },
  roti: { blurb: 'Oven, mixer, chiller, display cooler', tag: 'MVP' },
  kustom: { blurb: 'Kios kosong — tambah alat sendiri', tag: 'Bebas' },
};

/** Katalog alat untuk template Kustom: gabungan unik semua alat template. */
export const APPLIANCE_CATALOG: TemplateAppliance[] = (() => {
  const seen = new Map<string, TemplateAppliance>();
  for (const t of TEMPLATES) for (const a of t.appliances) if (!seen.has(a.id)) seen.set(a.id, a);
  return [...seen.values()];
})();

export function getTemplate(id: string): KiosTemplate {
  return TEMPLATES.find((t) => t.template_id === id) ?? TEMPLATES[0]!;
}

export function getTariff(idOrName: string): TariffOption {
  return (
    TARIFF_OPTIONS.find((t) => t.id === idOrName || t.name === idOrName) ??
    TARIFF_OPTIONS.find((t) => t.id === 'rate_b1_2200')!
  );
}
