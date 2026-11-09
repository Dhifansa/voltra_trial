export type PlanTier = 'free' | 'plus';

export type SubscriptionStateStatus =
  | 'free'
  | 'plus'
  | 'pending'
  | 'expired'
  | 'loading'
  | 'error';

export type BillingCycle = 'monthly' | 'yearly';

export interface PlanPricing {
  priceMonthly: number;
  currency: string;
}

export interface PlanFeatureItem {
  id: string;
  category: 'core' | 'ai' | 'analytics' | 'support';
  nameId: string;
  nameEn: string;
  descId?: string;
  descEn?: string;
  free: string | boolean;
  plus: string | boolean;
  highlight?: boolean;
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  badgeId?: string;
  badgeEn?: string;
  descriptionId: string;
  descriptionEn: string;
  pricing: PlanPricing;
  keyHighlightsId: string[];
  keyHighlightsEn: string[];
}

export interface UserSubscriptionMock {
  status: SubscriptionStateStatus;
  currentPlan: PlanTier;
  billingCycle?: BillingCycle;
  expiresAt?: string;
  invoiceId?: string;
  pendingAmount?: number;
}

export const SUBSCRIPTION_PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    descriptionId: 'Paket dasar gratis untuk simulasi Kios 2D & pemantauan listrik harian usaha.',
    descriptionEn: 'Basic free plan to explore 2D Virtual Kiosk simulation and daily electricity tracking.',
    pricing: {
      priceMonthly: 0,
      currency: 'Rp',
    },
    keyHighlightsId: [
      '1 Template usaha Kios Virtual 2D',
      'Hingga 5 slot alat listrik simulasi',
      'Estimasi tagihan listrik harian & bulanan',
      'Catat meter manual & foto label (5x/bln)',
    ],
    keyHighlightsEn: [
      '1 Business template in 2D Virtual Kiosk',
      'Up to 5 simulated electrical appliances',
      'Daily & monthly bill estimation',
      'Manual meter log & photo label (5x/mo limit)',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    badgeId: 'Paling Populer',
    badgeEn: 'Recommended',
    descriptionId: 'Solusi lengkap untuk pangkas biaya listrik: foto meter tanpa batas & rekomendasi hemat presisi.',
    descriptionEn: 'Complete solution to cut electricity bills: unlimited meter photos & precise saving insights.',
    pricing: {
      priceMonthly: 19000,
      currency: 'Rp',
    },
    keyHighlightsId: [
      'Semua template usaha & alat tanpa batas',
      'Foto meter & catatan suara tanpa batas kuota',
      'Rekomendasi penghematan otomatis per alat',
      'Pengingat tutup toko harian via WhatsApp',
      'Ekspor laporan biaya listrik (PDF / Excel)',
    ],
    keyHighlightsEn: [
      'All business templates & unlimited appliances',
      'Unlimited meter photos & voice logs',
      'Automatic appliance saving recommendations',
      'Automated daily WhatsApp meter reminders',
      'Export cost reports to PDF / Excel',
    ],
  },
};

export const COMPARISON_FEATURES: PlanFeatureItem[] = [
  // Kategori: Simulasi & Kios 2D
  {
    id: 'templates',
    category: 'core',
    nameId: 'Pilihan Template Usaha Kios 2D',
    nameEn: '2D Kiosk Business Templates',
    descId: 'Laundry, Warung Makan, Bakery, & Studio Kustom',
    descEn: 'Laundry, Eatery, Bakery, & Custom Studio',
    free: '1 Template Terpilih',
    plus: 'Semua Template Bebas Berganti',
    highlight: true,
  },
  {
    id: 'slots_limit',
    category: 'core',
    nameId: 'Kapasitas Alat Listrik di Kios',
    nameEn: 'Kiosk Appliance Slot Limit',
    free: 'Hingga 5 Alat',
    plus: 'Tanpa Batas (Unlimited)',
    highlight: true,
  },
  {
    id: 'kios_game',
    category: 'core',
    nameId: 'Simulasi Interaktif & Karakter Terra',
    nameEn: 'Interactive Sim & Terra Avatar',
    free: true,
    plus: true,
  },
  {
    id: 'hour_tuning',
    category: 'core',
    nameId: 'Pengaturan Jam Pakai Alat Bebas',
    nameEn: 'Appliance Operating Hours Tuning',
    free: true,
    plus: true,
  },

  // Kategori: Pencatatan & AI Gateway
  {
    id: 'ocr_meter',
    category: 'ai',
    nameId: 'OCR Foto Meteran PLN (Deteksi Angka)',
    nameEn: 'PLN Meter Photo OCR (Digit Detection)',
    free: '5x per bulan',
    plus: 'Tanpa Batas (Unlimited)',
    highlight: true,
  },
  {
    id: 'ocr_label',
    category: 'ai',
    nameId: 'OCR Label Spesifikasi Alat (Watt/Model)',
    nameEn: 'Appliance Label OCR (Watt/Model)',
    free: '5x per bulan',
    plus: 'Tanpa Batas (Unlimited)',
  },
  {
    id: 'voice_stt',
    category: 'ai',
    nameId: 'Catatan Suara Jam Pakai (Speech-to-Text)',
    nameEn: 'Voice Usage Logging (Speech-to-Text)',
    free: '3x per bulan',
    plus: 'Tanpa Batas (Unlimited)',
  },
  {
    id: 'wa_reminder',
    category: 'ai',
    nameId: 'Pengingat Misi Meter Harian via WhatsApp',
    nameEn: 'Daily WhatsApp Meter Mission Reminders',
    free: false,
    plus: true,
    highlight: true,
  },

  // Kategori: Analisis & Keuangan
  {
    id: 'daily_calc',
    category: 'analytics',
    nameId: 'Perhitungan Biaya Listrik Harian & Bulanan',
    nameEn: 'Daily & Monthly Cost Calculations',
    free: true,
    plus: true,
  },
  {
    id: 'ai_recommendations',
    category: 'analytics',
    nameId: 'Rekomendasi Hemat AI Berdasarkan Data Nyata',
    nameEn: 'AI Saving Insights from Real Data',
    free: 'Dasar (1 Saran)',
    plus: 'Lengkap & Prioritas Tertinggi',
    highlight: true,
  },
  {
    id: 'history_days',
    category: 'analytics',
    nameId: 'Riwayat Penyimpanan Data Listrik',
    nameEn: 'Historical Data Retention',
    free: '7 Hari Terakhir',
    plus: 'Selamanya (Unlimited History)',
  },
  {
    id: 'export_reports',
    category: 'analytics',
    nameId: 'Ekspor Laporan Keuangan (PDF / Excel)',
    nameEn: 'Export Financial Reports (PDF / Excel)',
    free: false,
    plus: true,
  },

  // Kategori: Dukungan & Akun
  {
    id: 'support_channel',
    category: 'support',
    nameId: 'Layanan Dukungan & Bantuan',
    nameEn: 'Support & Assistance Channels',
    free: 'Komunitas & Pusat Bantuan',
    plus: 'WhatsApp Prioritas Langsung',
  },
];

export const INITIAL_SUBSCRIPTION_STATE: UserSubscriptionMock = {
  status: 'free',
  currentPlan: 'free',
  billingCycle: 'monthly',
  expiresAt: undefined,
};

