/**
 * Electricity rate configuration
 * Owner: Mahdi, Sprint: S2
 * 
 * ponytail: config file untuk dev, production pakai DB/admin API nanti
 */

export interface ElectricityRateConfig {
  /** Rate ID */
  id: string;
  /** Display name */
  name: string;
  /** Rate per kWh (Rp) */
  rate: number;
  /** Category: residential | commercial */
  category: 'residential' | 'commercial';
  /** Description */
  description: string;
}

export const ELECTRICITY_RATES: ElectricityRateConfig[] = [
  {
    id: 'rate_r1_900',
    name: 'R-1/TR 900 VA',
    rate: 1352,
    category: 'residential',
    description: 'Rumah tangga 900 VA (subsidi)',
  },
  {
    id: 'rate_r1_1300',
    name: 'R-1/TR 1300 VA',
    rate: 1444.7,
    category: 'residential',
    description: 'Rumah tangga 1300 VA',
  },
  {
    id: 'rate_r1_2200',
    name: 'R-1/TR 2200 VA',
    rate: 1444.7,
    category: 'residential',
    description: 'Rumah tangga 2200 VA',
  },
  {
    id: 'rate_b1_1300',
    name: 'B-1/TR 1300 VA',
    rate: 1444.7,
    category: 'commercial',
    description: 'Bisnis 1300 VA (UMKM kecil)',
  },
  {
    id: 'rate_b1_2200',
    name: 'B-1/TR 2200 VA',
    rate: 1444.7,
    category: 'commercial',
    description: 'Bisnis 2200 VA',
  },
  {
    id: 'rate_b2_3500',
    name: 'B-2/TR 3500-5500 VA',
    rate: 1699.53,
    category: 'commercial',
    description: 'Bisnis 3500-5500 VA (UMKM sedang)',
  },
];

export function getElectricityRate(rateId: string): ElectricityRateConfig | undefined {
  return ELECTRICITY_RATES.find((r) => r.id === rateId);
}

export function getDefaultRate(): ElectricityRateConfig {
  return ELECTRICITY_RATES.find((r) => r.id === 'rate_b1_2200')!;
}
