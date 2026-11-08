'use client';

import { useState } from 'react';
import { Bezel, Eyebrow, IslandButton, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { formatRp } from '@/lib/format';
import { getDictionary } from '@/lib/i18n';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionStateStatus,
} from '@/lib/subscription-config';
import { FeatureComparison } from './feature-comparison';
import { PricingCard } from './pricing-card';
import { SubscriptionStatusBadge } from './subscription-status-badge';

export function SubscriptionPageContent() {
  const { settings, profile, updateProfile } = useVoltraApp();
  const lang = settings.language || 'id';
  const isEn = lang === 'en';
  const t = getDictionary(lang);

  const [status, setStatus] = useState<SubscriptionStateStatus>(
    profile.subscriptionPlan === 'plus' ? 'plus' : 'free',
  );
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function triggerNotice(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3800);
  }

  function handleStatusChange(nextStatus: SubscriptionStateStatus) {
    setStatus(nextStatus);
    if (nextStatus === 'plus') {
      updateProfile({
        subscriptionPlan: 'plus',
        subscriptionStatus: 'active',
        trialDaysLeft: 365,
      });
    } else if (nextStatus === 'free') {
      updateProfile({
        subscriptionPlan: 'free',
        subscriptionStatus: 'trial',
        trialDaysLeft: 30,
      });
    } else if (nextStatus === 'pending' || nextStatus === 'expired') {
      updateProfile({ subscriptionStatus: nextStatus });
    }
  }

  function handleUpgradeClick() {
    setIsUpgrading(true);
    // Simulasi inisialisasi checkout session (siap disambungkan ke Stripe / backend)
    setTimeout(() => {
      setIsUpgrading(false);
      setShowCheckoutModal(true);
    }, 600);
  }

  function handleConfirmPaymentSimulation() {
    setShowCheckoutModal(false);
    // Simulasi transisi ke status Pending pembayaran
    handleStatusChange('pending');
    triggerNotice(
      isEn
        ? 'Payment initiated! Verifying checkout with billing gateway...'
        : 'Pembayaran diinisiasi! Menunggu konfirmasi gerbang pembayaran...',
    );
  }

  const plusPlan = SUBSCRIPTION_PLANS.plus;
  const plusPrice = plusPlan.pricing.priceMonthly;

  return (
    <div className="sub-container stack-gap">
      {/* Toast Notice */}
      {notice && (
        <div className="notice" role="status">
          <Icon name="check" size={18} />
          <div>{notice}</div>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="page-head sub-header">
        <Reveal>
          <div className="row-between sub-header__top-row">
            <Eyebrow>{t.subscription.eyebrow}</Eyebrow>
            <div className="sub-header__badge-wrap">
              <span className="sub-header__status-label">
                {t.subscription.currentPlanBadge}:
              </span>
              <SubscriptionStatusBadge status={status} lang={lang} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="display">
            {t.subscription.titlePre}
            <em>{t.subscription.titleHighlight}</em>
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="lede">{t.subscription.lede}</p>
        </Reveal>
      </section>

      {/* CONDITIONAL STATE BANNERS (Pending, Expired, Error, Loading) */}
      {status === 'pending' && (
        <Reveal>
          <div className="sub-state-banner sub-state-banner--pending" role="alert">
            <div className="sub-state-banner__icon">
              <Icon name="alert" size={24} />
            </div>
            <div className="sub-state-banner__body">
              <h4 className="sub-state-banner__title">{t.subscription.pendingTitle}</h4>
              <p className="sub-state-banner__desc">{t.subscription.pendingDesc}</p>
              <div className="sub-state-banner__actions">
                <button
                  type="button"
                  className="sub-state-banner__btn"
                  onClick={() => {
                    handleStatusChange('plus');
                    triggerNotice(
                      isEn
                        ? 'Payment verified! Your account is now upgraded to Plus.'
                        : 'Pembayaran terverifikasi! Akun Anda kini aktif di paket Plus.',
                    );
                  }}
                >
                  <Icon name="check" size={15} />
                  <span>{isEn ? 'Simulate Success Verification' : 'Simulasi Pembayaran Berhasil'}</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {status === 'expired' && (
        <Reveal>
          <div className="sub-state-banner sub-state-banner--expired" role="alert">
            <div className="sub-state-banner__icon">
              <Icon name="info" size={24} />
            </div>
            <div className="sub-state-banner__body">
              <h4 className="sub-state-banner__title">{t.subscription.expiredTitle}</h4>
              <p className="sub-state-banner__desc">{t.subscription.expiredDesc}</p>
              <div className="sub-state-banner__actions">
                <IslandButton icon="crown" onClick={handleUpgradeClick}>
                  {t.subscription.renewBtn}
                </IslandButton>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {status === 'error' && (
        <Reveal>
          <div className="sub-state-banner sub-state-banner--error" role="alert">
            <div className="sub-state-banner__icon">
              <Icon name="close" size={24} />
            </div>
            <div className="sub-state-banner__body">
              <h4 className="sub-state-banner__title">{t.subscription.errorTitle}</h4>
              <p className="sub-state-banner__desc">{t.subscription.errorDesc}</p>
              <div className="sub-state-banner__actions">
                <button
                  type="button"
                  className="sub-state-banner__btn"
                  onClick={() => {
                    setStatus('loading');
                    setTimeout(() => setStatus('free'), 800);
                  }}
                >
                  <Icon name="retry" size={15} />
                  <span>{t.subscription.retryBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* SKELETON LOADING STATE */}
      {status === 'loading' ? (
        <div className="sub-loading-wrap" aria-busy="true" aria-label="Loading plans">
          <div className="sub-pricing-grid">
            <div className="sub-skeleton sub-skeleton--card" />
            <div className="sub-skeleton sub-skeleton--card is-tall" />
          </div>
        </div>
      ) : (
        <>
          {/* PRICING CARDS (Side-by-side) */}
          <section className="sub-pricing-section" aria-label="Subscription Plans">
            <div className="sub-pricing-grid">
              <PricingCard
                plan={SUBSCRIPTION_PLANS.free}
                currentStatus={status}
                onUpgrade={handleUpgradeClick}
                lang={lang}
              />

              <PricingCard
                plan={SUBSCRIPTION_PLANS.plus}
                currentStatus={status}
                onUpgrade={handleUpgradeClick}
                isUpgrading={isUpgrading}
                lang={lang}
              />
            </div>
          </section>

          {/* FEATURE COMPARISON TABLE */}
          <section className="sub-comparison-section" aria-label="Feature Comparison">
            <FeatureComparison lang={lang} />
          </section>

          {/* BOTTOM UPGRADE CALL-TO-ACTION (CTA BANNER) */}
          {status !== 'plus' && (
            <Reveal delay={100}>
              <Bezel tone="moss" coreClassName="sub-bottom-cta">
                <div className="row-between sub-bottom-cta__inner">
                  <div className="sub-bottom-cta__text">
                    <Eyebrow>{isEn ? 'Scale Up Your Business' : 'Tingkatkan Skala Usaha'}</Eyebrow>
                    <h3 className="sub-bottom-cta__title">
                      {isEn
                        ? `Ready to maximize electricity efficiency for ${profile.businessName}?`
                        : `Siap pangkas tagihan listrik ${profile.businessName} hingga maksimal?`}
                    </h3>
                    <p className="hint">
                      {isEn
                        ? `Get unlimited AI OCR meter recognition, WhatsApp daily mission reminders, and instant expert insights.`
                        : `Dapatkan otomasi AI OCR tanpa batas, pengingat harian WhatsApp, dan rekomendasi hemat presisi.`}
                    </p>
                  </div>
                  <div className="sub-bottom-cta__btn-wrap">
                    <button
                      type="button"
                      onClick={handleUpgradeClick}
                      className="sub-pricing-card__btn sub-pricing-card__btn--upgrade"
                    >
                      <Icon name="arrowRight" size={15} />
                      <span>{t.subscription.upgradeBtn}</span>
                    </button>
                  </div>
                </div>
              </Bezel>
            </Reveal>
          )}

          {/* FAQ SECTION (Clean & Essential) */}
          <section className="sub-faq-section" aria-label="Frequently Asked Questions">
            <Bezel tone="paper" coreClassName="sub-faq-core">
              <Eyebrow>{t.subscription.faqTitle}</Eyebrow>
              <div className="sub-faq-list">
                <div className="sub-faq-item">
                  <h4 className="sub-faq-question">
                    {isEn
                      ? 'Can I cancel my subscription at any time?'
                      : 'Apakah saya bisa membatalkan langganan kapan saja?'}
                  </h4>
                  <p className="hint">
                    {isEn
                      ? 'Yes, absolutely. You can cancel with a single click in Settings. Your Plus features will remain active until the end of your billing cycle.'
                      : 'Ya, tentu saja. Anda dapat membatalkan kapan saja melalui menu Pengaturan. Fitur Plus akan tetap aktif sampai akhir periode penagihan Anda.'}
                  </p>
                </div>
                <div className="sub-faq-item">
                  <h4 className="sub-faq-question">
                    {isEn
                      ? 'What payment methods are supported?'
                      : 'Metode pembayaran apa saja yang didukung?'}
                  </h4>
                  <p className="hint">
                    {isEn
                      ? 'We support Credit/Debit Cards, QRIS, GoPay, OVO, ShopeePay, and Bank Virtual Account transfers (BCA, Mandiri, BNI, BRI).'
                      : 'Kami mendukung QRIS, Transfer Virtual Account Bank (BCA, Mandiri, BRI, BNI), Kartu Debit/Kredit, dan e-Wallet resmi.'}
                  </p>
                </div>
              </div>
            </Bezel>
          </section>
        </>
      )}

      {/* CHECKOUT MODAL PLACEHOLDER (Ready for Stripe / Midtrans Backend) */}
      {showCheckoutModal && (
        <div
          className="outlet-modal-backdrop"
          onClick={() => setShowCheckoutModal(false)}
          role="presentation"
        >
          <div
            className="outlet-modal-dialog sub-checkout-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t.subscription.checkoutTitle}
          >
            <div className="outlet-modal-header">
              <div className="row-gap" style={{ alignItems: 'center' }}>
                <Icon name="bolt" size={17} />
                <span className="outlet-modal-title">{t.subscription.checkoutTitle}</span>
              </div>
              <button
                type="button"
                className="outlet-modal-close"
                onClick={() => setShowCheckoutModal(false)}
                aria-label={t.common.close}
              >
                ✕
              </button>
            </div>

            <div className="sub-checkout-body">
              <div className="sub-checkout-plan-summary">
                <div className="row-between">
                  <div>
                    <h4 className="sub-checkout-plan-name">Voltra Plus ({isEn ? 'Monthly' : 'Bulanan'})</h4>
                    <p className="hint">
                      {isEn ? 'Access to all business templates & unlimited AI Gateway' : 'Akses semua template usaha & AI Gateway unlimited'}
                    </p>
                  </div>
                  <div className="sub-checkout-price">
                    <strong>{formatRp(plusPrice)}</strong>
                    <span>/{isEn ? 'mo' : 'bln'}</span>
                  </div>
                </div>
              </div>

              <div className="sub-checkout-meta">
                <div className="row-between sub-checkout-meta-row">
                  <span>{isEn ? 'Business Name' : 'Nama Usaha'}</span>
                  <strong>{profile.businessName}</strong>
                </div>
                <div className="row-between sub-checkout-meta-row">
                  <span>{isEn ? 'Payment Gateway' : 'Gerbang Pembayaran'}</span>
                  <span className="chip chip--mock">Stripe / QRIS Gateway</span>
                </div>
              </div>

              <div className="sub-checkout-notice">
                <Icon name="shield" size={16} />
                <p>
                  {isEn
                    ? 'This is a UI simulation. Clicking proceed will simulate a pending checkout verification.'
                    : 'Ini adalah demonstrasi UI frontend. Menekan tombol di bawah akan menguji alur verifikasi transaksi.'}
                </p>
              </div>

              <div className="sub-checkout-actions">
                <button
                  type="button"
                  className="sub-pricing-card__btn sub-pricing-card__btn--upgrade"
                  onClick={handleConfirmPaymentSimulation}
                >
                  <Icon name="arrowRight" size={17} />
                  <span>{t.subscription.checkoutProceed}</span>
                </button>
                <button
                  type="button"
                  className="textlink"
                  onClick={() => setShowCheckoutModal(false)}
                >
                  {t.subscription.checkoutCancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
