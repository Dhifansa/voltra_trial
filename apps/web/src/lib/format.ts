/**
 * Helper format tampilan saja. Tidak ada rumus energi di sini;
 * semua angka kWh/Rp berasal dari `@voltra/energy-calc` atau respons API.
 */
import type { Confidence } from '@voltra/contracts';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

export function formatRp(value: number): string {
  return rupiah.format(value).replace(/\u00a0/g, ' ');
}

export function formatKwh(value: number): string {
  return `${decimal.format(value)} kWh`;
}

export function formatNumber(value: number): string {
  return decimal.format(value);
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: 'Keyakinan tinggi',
  medium: 'Keyakinan sedang',
  low: 'Keyakinan rendah',
};

export const CONFIDENCE_SHORT: Record<Confidence, string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
};

