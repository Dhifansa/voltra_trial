'use client';

import { Bezel, Eyebrow } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import {
  COMPARISON_FEATURES,
  type PlanFeatureItem,
} from '@/lib/subscription-config';

interface FeatureComparisonProps {
  lang?: 'id' | 'en';
}

export function FeatureComparison({ lang = 'id' }: FeatureComparisonProps) {
  const isEn = lang === 'en';

  const categoryLabels: Record<PlanFeatureItem['category'], string> = {
    core: isEn ? '2D Virtual Kiosk Simulation' : 'Simulasi Kios 2D & Energi',
    ai: isEn ? 'AI Gateway Automation (OCR & Voice)' : 'Otomasi AI Gateway (OCR & Suara)',
    analytics: isEn ? 'Cost Analytics & Reports' : 'Analisis Biaya & Laporan',
    support: isEn ? 'Support & Assistance' : 'Layanan Dukungan & Bantuan',
  };

  const categories: Array<PlanFeatureItem['category']> = [
    'core',
    'ai',
    'analytics',
    'support',
  ];

  function renderValue(val: boolean | string, isPlus = false) {
    if (typeof val === 'boolean') {
      if (val) {
        return (
          <span className={`sub-comp-icon sub-comp-icon--check ${isPlus ? 'is-plus' : ''}`}>
            <Icon name="check" size={16} />
          </span>
        );
      }
      return <span className="sub-comp-icon sub-comp-icon--dash">—</span>;
    }

    return (
      <span className={`sub-comp-text ${isPlus ? 'sub-comp-text--plus' : ''}`}>
        {val}
      </span>
    );
  }

  return (
    <Bezel tone="paper" className="sub-comparison-bezel" coreClassName="sub-comparison-core">
      <div className="sub-comparison-head">
        <Eyebrow>{isEn ? 'Feature Matrix' : 'Matriks Fitur'}</Eyebrow>
        <h3 className="sub-comparison-title">
          {isEn ? 'Compare Free vs Plus' : 'Perbandingan Lengkap Free vs Plus'}
        </h3>
        <p className="hint">
          {isEn
            ? 'Detailed capabilities and quota comparison between tiers.'
            : 'Perbandingan detail kemampuan, kuota, dan fitur antar paket.'}
        </p>
      </div>

      <div className="sub-comparison-table-wrap">
        <table className="sub-comparison-table" role="table">
          <thead>
            <tr>
              <th scope="col" className="sub-col-feature">
                {isEn ? 'Features' : 'Fitur & Kemampuan'}
              </th>
              <th scope="col" className="sub-col-free">
                Free
              </th>
              <th scope="col" className="sub-col-plus">
                <div className="sub-col-plus-head">
                  <Icon name="crown" size={15} />
                  <span>Plus</span>
                </div>
              </th>
            </tr>
          </thead>
          {categories.map((cat) => {
            const items = COMPARISON_FEATURES.filter((f) => f.category === cat);
            return (
              <tbody key={cat} className="sub-category-group">
                <tr className="sub-category-row">
                  <td colSpan={3} className="sub-category-header">
                    {categoryLabels[cat]}
                  </td>
                </tr>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`sub-feature-row ${item.highlight ? 'is-highlight' : ''}`}
                  >
                    <td className="sub-cell-feature">
                      <div className="sub-feature-info">
                        <span className="sub-feature-name">
                          {isEn ? item.nameEn : item.nameId}
                        </span>
                        {(item.descEn || item.descId) && (
                          <span className="sub-feature-desc">
                            {isEn ? item.descEn : item.descId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="sub-cell-val sub-cell-free">
                      {renderValue(item.free, false)}
                    </td>
                    <td className="sub-cell-val sub-cell-plus">
                      {renderValue(item.plus, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
    </Bezel>
  );
}
