'use client';

import { useState } from 'react';
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
  const [mobileTab, setMobileTab] = useState<'all' | 'free' | 'plus'>('all');

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

        {/* Mobile View Switcher (Khusus Tampilan Mobile / Layar Kecil) */}
        <div className="sub-comp-mobile-tabs" role="tablist" aria-label="Tampilan perbandingan fitur">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'all'}
            className={`sub-comp-mobile-tab ${mobileTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setMobileTab('all')}
          >
            <span>{isEn ? 'Side-by-Side' : 'Berdampingan'}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'free'}
            className={`sub-comp-mobile-tab ${mobileTab === 'free' ? 'is-active' : ''}`}
            onClick={() => setMobileTab('free')}
          >
            <span>Free</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'plus'}
            className={`sub-comp-mobile-tab sub-comp-mobile-tab--plus ${mobileTab === 'plus' ? 'is-active' : ''}`}
            onClick={() => setMobileTab('plus')}
          >
            <Icon name="crown" size={13} />
            <span>Plus</span>
          </button>
        </div>
      </div>

      {/* 1. TAMPILAN SIDE-BY-SIDE MATRIX TABLE (Desktop & Mobile Swipeable dengan Sticky Kolom Pertama) */}
      <div className={`sub-comparison-table-wrap ${mobileTab !== 'all' ? 'is-mobile-hidden' : ''}`}>
        <div className="sub-table-scroll-hint">
          <Icon name="arrowRight" size={13} />
          <span>{isEn ? 'Swipe horizontally to compare columns' : 'Geser ke samping untuk melihat seluruh kolom'}</span>
        </div>

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

      {/* 2. TAMPILAN MOBILE LIST CARD (Khusus saat user memilih tab 'Free' atau 'Plus' di HP) */}
      {mobileTab !== 'all' && (
        <div className="sub-comp-mobile-list" role="region" aria-label={`Daftar fitur paket ${mobileTab}`}>
          <div className="sub-comp-mobile-list-header">
            <span className={`chip ${mobileTab === 'plus' ? 'chip--high' : 'chip--mock'}`}>
              {mobileTab === 'plus' ? 'Paket Voltra Plus (Rp 19.000/bln)' : 'Paket Free (Rp 0)'}
            </span>
          </div>

          {categories.map((cat) => {
            const items = COMPARISON_FEATURES.filter((f) => f.category === cat);
            return (
              <div key={cat} className="sub-comp-mobile-cat-group">
                <h5 className="sub-comp-mobile-cat-title">{categoryLabels[cat]}</h5>
                <ul className="sub-comp-mobile-items">
                  {items.map((item) => {
                    const val = mobileTab === 'plus' ? item.plus : item.free;
                    return (
                      <li key={item.id} className="sub-comp-mobile-item">
                        <div className="sub-comp-mobile-item__main">
                          <span className="sub-comp-mobile-item__name">
                            {isEn ? item.nameEn : item.nameId}
                          </span>
                          {(item.descEn || item.descId) && (
                            <span className="sub-comp-mobile-item__desc">
                              {isEn ? item.descEn : item.descId}
                            </span>
                          )}
                        </div>
                        <div className="sub-comp-mobile-item__val">
                          {renderValue(val, mobileTab === 'plus')}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Bezel>
  );
}
