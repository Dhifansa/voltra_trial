'use client';

import type { BillingCycle } from '@/lib/subscription-config';

interface BillingToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  lang?: 'id' | 'en';
}

export function BillingToggle({ cycle, onChange, lang = 'id' }: BillingToggleProps) {
  const isEn = lang === 'en';

  return (
    <div className="sub-billing-toggle-wrap">
      <div
        className="sub-billing-toggle"
        role="radiogroup"
        aria-label={isEn ? 'Billing frequency' : 'Pilihan penagihan'}
      >
        <button
          type="button"
          role="radio"
          aria-checked={cycle === 'monthly'}
          className={`sub-billing-toggle__btn ${cycle === 'monthly' ? 'is-active' : ''}`}
          onClick={() => onChange('monthly')}
        >
          {isEn ? 'Monthly' : 'Bulanan'}
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={cycle === 'yearly'}
          className={`sub-billing-toggle__btn ${cycle === 'yearly' ? 'is-active' : ''}`}
          onClick={() => onChange('yearly')}
        >
          <span>{isEn ? 'Yearly' : 'Tahunan'}</span>
          <span className="sub-billing-toggle__badge">
            {isEn ? 'Save 20%' : 'Hemat 20%'}
          </span>
        </button>
      </div>
    </div>
  );
}

