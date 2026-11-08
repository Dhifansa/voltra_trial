'use client';

import { Icon } from '@/components/ui/icon';
import type { SubscriptionStateStatus } from '@/lib/subscription-config';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStateStatus;
  lang?: 'id' | 'en';
  size?: 'sm' | 'md';
}

export function SubscriptionStatusBadge({
  status,
  lang = 'id',
  size = 'md',
}: SubscriptionStatusBadgeProps) {
  const isEn = lang === 'en';

  switch (status) {
    case 'plus':
      return (
        <span className={`sub-status-badge sub-status-badge--plus sub-status-badge--${size}`}>
          <Icon name="crown" size={size === 'sm' ? 12 : 14} />
          <span>{isEn ? 'Plus Active' : 'Paket Plus Aktif'}</span>
        </span>
      );

    case 'pending':
      return (
        <span className={`sub-status-badge sub-status-badge--pending sub-status-badge--${size}`}>
          <Icon name="alert" size={size === 'sm' ? 12 : 14} />
          <span>{isEn ? 'Pending Payment' : 'Menunggu Pembayaran'}</span>
        </span>
      );

    case 'expired':
      return (
        <span className={`sub-status-badge sub-status-badge--expired sub-status-badge--${size}`}>
          <Icon name="info" size={size === 'sm' ? 12 : 14} />
          <span>{isEn ? 'Plus Expired' : 'Langganan Berakhir'}</span>
        </span>
      );

    case 'loading':
      return (
        <span className={`sub-status-badge sub-status-badge--loading sub-status-badge--${size}`}>
          <span className="sub-status-badge__dot" />
          <span>{isEn ? 'Loading Status...' : 'Memuat Status...'}</span>
        </span>
      );

    case 'error':
      return (
        <span className={`sub-status-badge sub-status-badge--error sub-status-badge--${size}`}>
          <Icon name="close" size={size === 'sm' ? 12 : 14} />
          <span>{isEn ? 'Sync Error' : 'Kendala Status'}</span>
        </span>
      );

    case 'free':
    default:
      return (
        <span className={`sub-status-badge sub-status-badge--free sub-status-badge--${size}`}>
          <Icon name="bolt" size={size === 'sm' ? 12 : 14} />
          <span>{isEn ? 'Free Plan' : 'Paket Free (Dasar)'}</span>
        </span>
      );
  }
}
