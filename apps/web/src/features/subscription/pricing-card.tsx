'use client';

import { Bezel, Eyebrow, IslandButton } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { formatRp } from '@/lib/format';
import type { BillingCycle, PlanConfig, SubscriptionStateStatus } from '@/lib/subscription-config';

interface PricingCardProps {
  plan: PlanConfig;
  currentStatus: SubscriptionStateStatus;
  billingCycle: BillingCycle;
  onUpgrade: () => void;
  isUpgrading?: boolean;
  lang?: 'id' | 'en';
}

export function PricingCard({
  plan,
  currentStatus,
  billingCycle,
  onUpgrade,
  isUpgrading = false,
  lang = 'id',
}: PricingCardProps) {
  const isEn = lang === 'en';
  const isPlus = plan.id === 'plus';
  const isCurrentActive =
    (plan.id === 'free' && currentStatus === 'free') ||
    (plan.id === 'plus' && currentStatus === 'plus');

  const price =
    billingCycle === 'yearly' ? plan.pricing.priceYearly : plan.pricing.priceMonthly;

  const highlights = isEn ? plan.keyHighlightsEn : plan.keyHighlightsId;
  const description = isEn ? plan.descriptionEn : plan.descriptionId;
  const badge = isEn ? plan.badgeEn : plan.badgeId;

  return (
    <Bezel
      tone={isPlus ? 'ink' : 'paper'}
      className={`sub-pricing-card ${isPlus ? 'sub-pricing-card--plus' : 'sub-pricing-card--free'} ${
        isCurrentActive ? 'sub-pricing-card--active' : ''
      }`}
      coreClassName="sub-pricing-card__core"
    >
      {/* Top Header: Badge Rekomendasi (khusus Plus) */}
      <div className="sub-pricing-card__head">
        <div className="row-between">
          <div className="sub-pricing-card__title-row">
            {isPlus && <Icon name="crown" size={20} className="sub-pricing-card__crown-icon" />}
            <span className="sub-pricing-card__name">{plan.name}</span>
          </div>

          {isPlus && badge && (
            <span className="sub-pricing-card__recommended-pill">
              {badge}
            </span>
          )}

          {!isPlus && isCurrentActive && (
            <span className="sub-pricing-card__current-pill">
              <Icon name="check" size={13} />
              {isEn ? 'Current Plan' : 'Paket Aktif'}
            </span>
          )}
        </div>

        <p className="sub-pricing-card__desc">{description}</p>
      </div>

      {/* Pricing Figure */}
      <div className="sub-pricing-card__pricing">
        <div className="sub-pricing-card__amount-row">
          <span className="sub-pricing-card__currency">{plan.pricing.currency}</span>
          <span className="sub-pricing-card__amount">
            {price === 0 ? '0' : formatRp(price).replace('Rp', '').trim()}
          </span>
          <span className="sub-pricing-card__period">
            {price === 0
              ? ` (${isEn ? 'Free Forever' : 'Gratis Selamanya'})`
              : `/${isEn ? 'mo' : 'bln'}`}
          </span>
        </div>

        {isPlus && price > 0 && (
          <p className="sub-pricing-card__billing-note">
            {billingCycle === 'yearly'
              ? isEn
                ? `Billed annually (${formatRp(plan.pricing.yearlyBilledTotal)}/yr)`
                : `Ditagih tahunan (${formatRp(plan.pricing.yearlyBilledTotal)}/tahun)`
              : isEn
                ? 'Billed monthly, cancel anytime'
                : 'Ditagih per bulan, bisa dibatalkan kapan saja'}
          </p>
        )}
      </div>

      {/* Feature Checklist */}
      <div className="sub-pricing-card__features">
        <Eyebrow tone={isPlus ? 'light' : 'default'}>
          {isPlus
            ? isEn
              ? 'Included in Plus:'
              : 'Fitur Unggulan Plus:'
            : isEn
              ? 'Included in Free:'
              : 'Fitur Paket Free:'}
        </Eyebrow>

        <ul className="sub-pricing-card__list">
          {highlights.map((feat, idx) => (
            <li key={idx} className="sub-pricing-card__item">
              <span className={`sub-pricing-card__check ${isPlus ? 'is-plus' : ''}`}>
                <Icon name="check" size={14} />
              </span>
              <span className="sub-pricing-card__text">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action CTA Button */}
      <div className="sub-pricing-card__action">
        {isPlus ? (
          currentStatus === 'plus' ? (
            <button
              type="button"
              disabled
              className="sub-pricing-card__btn sub-pricing-card__btn--active"
            >
              <Icon name="check" size={16} />
              <span>{isEn ? 'Current Active Plan' : 'Paket Saat Ini (Aktif)'}</span>
            </button>
          ) : currentStatus === 'pending' ? (
            <IslandButton
              icon="alert"
              onClick={onUpgrade}
              className="sub-pricing-card__btn sub-pricing-card__btn--pending"
            >
              {isEn ? 'Check Payment Status' : 'Cek Status Pembayaran'}
            </IslandButton>
          ) : currentStatus === 'expired' ? (
            <IslandButton
              icon="retry"
              onClick={onUpgrade}
              className="sub-pricing-card__btn sub-pricing-card__btn--renew"
            >
              {isEn ? 'Renew Plus Plan' : 'Perpanjang Paket Plus'}
            </IslandButton>
          ) : (
            <button
              type="button"
              onClick={onUpgrade}
              disabled={isUpgrading}
              className={`sub-pricing-card__btn sub-pricing-card__btn--upgrade ${
                isUpgrading ? 'is-loading' : ''
              }`}
            >
              {isUpgrading ? (
                <>
                  <span className="sub-spinner" aria-hidden="true" />
                  <span>{isEn ? 'Connecting...' : 'Menghubungkan...'}</span>
                </>
              ) : (
                <>
                  <Icon name="crown" size={17} />
                  <span>{isEn ? 'Upgrade to Plus' : 'Upgrade ke Plus'}</span>
                </>
              )}
            </button>
          )
        ) : (
          <button
            type="button"
            disabled
            className="sub-pricing-card__btn sub-pricing-card__btn--free"
          >
            {isCurrentActive
              ? isEn
                ? 'Your Current Plan'
                : 'Paket Anda Saat Ini'
              : isEn
                ? 'Free Tier'
                : 'Paket Gratis'}
          </button>
        )}
      </div>
    </Bezel>
  );
}
