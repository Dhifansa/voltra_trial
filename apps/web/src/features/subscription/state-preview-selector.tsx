'use client';

import { Icon } from '@/components/ui/icon';
import type { SubscriptionStateStatus } from '@/lib/subscription-config';

interface StatePreviewSelectorProps {
  current: SubscriptionStateStatus;
  onChange: (status: SubscriptionStateStatus) => void;
  lang?: 'id' | 'en';
}

const STATES: Array<{ id: SubscriptionStateStatus; labelId: string; labelEn: string }> = [
  { id: 'free', labelId: 'Free (Dasar)', labelEn: 'Free (Basic)' },
  { id: 'plus', labelId: 'Plus (Aktif)', labelEn: 'Plus (Active)' },
  { id: 'pending', labelId: 'Pending Pembayaran', labelEn: 'Pending Payment' },
  { id: 'expired', labelId: 'Langganan Expired', labelEn: 'Expired' },
  { id: 'loading', labelId: 'Loading State', labelEn: 'Loading State' },
  { id: 'error', labelId: 'Error State', labelEn: 'Error State' },
];

export function StatePreviewSelector({
  current,
  onChange,
  lang = 'id',
}: StatePreviewSelectorProps) {
  const isEn = lang === 'en';

  return (
    <aside className="sub-preview-selector" aria-label="Subscription State Preview Selector">
      <div className="sub-preview-selector__head">
        <Icon name="settings" size={14} />
        <span>{isEn ? 'UI State Preview Mode:' : 'Mode Simulasi Status UI:'}</span>
      </div>
      <div className="sub-preview-selector__list" role="radiogroup">
        {STATES.map((st) => (
          <button
            key={st.id}
            type="button"
            role="radio"
            aria-checked={current === st.id}
            className={`sub-preview-selector__chip ${current === st.id ? 'is-active' : ''}`}
            onClick={() => onChange(st.id)}
          >
            {isEn ? st.labelEn : st.labelId}
          </button>
        ))}
      </div>
    </aside>
  );
}

