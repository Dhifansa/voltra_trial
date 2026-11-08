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
  priceYearly: number; // Harga per bulan jika bayar tahunan
  yearlyBilledTotal: number;
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
    descriptionId: 'Paket dasar gratis untuk mencoba simulasi Kios 2D & pemantauan listrik harian usaha.',
    descriptionEn: 'Basic free plan to explore 2D Virtual Kiosk simulation and daily electricity tracking.',
    pricing: {
      priceMonthly: 0,
      priceYearly: 0,
      yearlyBilledTotal: 0,
      currency: 'Rp',
    },
    keyHighlightsId: [
      '1 Template usaha Kios Virtual 2D',
      'Maksimal 5 slot alat listrik simulasi',
      'Estimasi tagihan harian & bulanan',
      'Catat meter manual & label alat (kuota 5x/bln)',
      'Dukungan komunitas & panduan dasar',
    ],
    keyHighlightsEn: [
      '1 Business template in 2D Virtual Kiosk',
      'Up to 5 simulated electrical appliances',
      'Daily & monthly bill estimation',
      'Manual meter log & OCR label (5x/mo limit)',
      'Community support & standard guides',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    badgeId: 'Paling Populer',
    badgeEn: 'Recommended',
    descriptionId: 'Solusi lengkap untuk UMKM aktif: AI Gateway tanpa batas, multi-outlet, & rekomendasi hemat presisi.',
    descriptionEn: 'Complete solution for active businesses: unlimited AI Gateway, multi-outlet & precise saving insights.',
    pricing: {
      priceMonthly: 49000,
      priceYearly: 39000,
      yearlyBilledTotal: 468000, // 39.000 x 12
      currency: 'Rp',
    },
    keyHighlightsId: [
      'Semua template usaha (Laundry, Warung, Roti, Kustom)',
      'Slot alat listrik tanpa batas di Kios 2D',
      'Otomasi AI OCR Foto Meter & Catatan Suara Unlimited',
      'Rekomendasi penghematan AI mendalam per alat',
      'Pengingat Misi Meter otomatis via WhatsApp harian',
      'Ekspor laporan keuangan & pemakaian energi (PDF/Excel)',
      'Dukungan prioritas WhatsApp langsung bersama tim ahli',
    ],
    keyHighlightsEn: [
      'All business templates (Laundry, Eatery, Bakery, Custom)',
      'Unlimited appliance slots in 2D Virtual Kiosk',
      'Unlimited AI OCR Meter Photos & Voice STT Logs',
      'In-depth AI electricity saving recommendations',
      'Automated daily WhatsApp meter mission reminders',
      'Export financial & energy reports (PDF/Excel)',
      'Priority WhatsApp support directly with specialists',
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

