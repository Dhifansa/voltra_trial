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
  const [checkoutStep, setCheckoutStep] = useState<'method' | 'qris'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va'>('qris');
  const [isVerifying, setIsVerifying] = useState(false);
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
    setTimeout(() => {
      setIsUpgrading(false);
      setCheckoutStep('method');
      setShowCheckoutModal(true);
    }, 400);
  }

  function handleProceedToPayment() {
    setCheckoutStep('qris');
  }

  function handleVerifyPayment() {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowCheckoutModal(false);
      handleStatusChange('plus');
      triggerNotice(
        isEn
          ? 'Payment successful! Your account is now upgraded to Voltra Plus.'
          : 'Pembayaran berhasil diverifikasi! Akun Anda kini aktif di paket Voltra Plus ⚡',
      );
    }, 1200);
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

          {/* FEATURE COMPARISON TABLE (COLLAPSIBLE) */}
          <section className="sub-comparison-section" aria-label="Feature Comparison">
            <FeatureComparison lang={lang} />
          </section>

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
          className="sub-modal-backdrop"
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
                      {isEn ? 'Full access to all AI features & automatic savings' : 'Akses penuh ke semua fitur AI & rekomendasi hemat'}
                    </p>
                  </div>
                  <div className="sub-checkout-price">
                    <strong>{formatRp(plusPrice)}</strong>
                    <span>/{isEn ? 'mo' : 'bln'}</span>
                  </div>
                </div>
              </div>

              {checkoutStep === 'method' ? (
                <>
                  <div className="field" style={{ margin: '1rem 0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      {isEn ? 'Select Payment Method' : 'Pilih Metode Pembayaran'}
                    </span>
                    <div className="pillset" role="radiogroup" aria-label="Metode pembayaran">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={paymentMethod === 'qris'}
                        className={paymentMethod === 'qris' ? 'is-active' : ''}
                        onClick={() => setPaymentMethod('qris')}
                      >
                        ⚡ QRIS (Semua E-Wallet)
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={paymentMethod === 'bca_va'}
                        className={paymentMethod === 'bca_va' ? 'is-active' : ''}
                        onClick={() => setPaymentMethod('bca_va')}
                      >
                        🏦 BCA Virtual Account
                      </button>
                    </div>
                  </div>

                  <div className="sub-checkout-meta">
                    <div className="row-between sub-checkout-meta-row">
                      <span>{isEn ? 'Business Name' : 'Nama Usaha'}</span>
                      <strong>{profile.businessName}</strong>
                    </div>
                    <div className="row-between sub-checkout-meta-row">
                      <span>{isEn ? 'Admin Fee' : 'Biaya Layanan'}</span>
                      <strong style={{ color: '#2DD4BF' }}>Rp 0 (Bebas Biaya)</strong>
                    </div>
                  </div>

                  <div className="sub-checkout-actions">
                    <button
                      type="button"
                      className="sub-pricing-card__btn sub-pricing-card__btn--upgrade"
                      onClick={handleProceedToPayment}
                    >
                      <Icon name="arrowRight" size={17} />
                      <span>{isEn ? 'Continue to Payment' : 'Lanjutkan Pembayaran'}</span>
                    </button>
                    <button
                      type="button"
                      className="textlink"
                      onClick={() => setShowCheckoutModal(false)}
                    >
                      {t.subscription.checkoutCancel}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {paymentMethod === 'qris' ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', margin: '1rem 0' }}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        Pindai QRIS dengan GoPay, OVO, Dana, atau BCA Mobile
                      </p>
                      {/* Simbol QRIS Bersih */}
                      <div style={{ display: 'inline-block', background: '#fff', padding: '12px', borderRadius: '8px' }}>
                        <svg width="140" height="140" viewBox="0 0 100 100" fill="#0F172A">
                          {/* Pola QR Dekoratif Modern */}
                          <rect x="5" y="5" width="25" height="25" fill="#0F172A" />
                          <rect x="10" y="10" width="15" height="15" fill="#FFF" />
                          <rect x="14" y="14" width="7" height="7" fill="#0F172A" />

                          <rect x="70" y="5" width="25" height="25" fill="#0F172A" />
                          <rect x="75" y="10" width="15" height="15" fill="#FFF" />
                          <rect x="79" y="14" width="7" height="7" fill="#0F172A" />

                          <rect x="5" y="70" width="25" height="25" fill="#0F172A" />
                          <rect x="10" y="75" width="15" height="15" fill="#FFF" />
                          <rect x="14" y="79" width="7" height="7" fill="#0F172A" />

                          <rect x="36" y="10" width="10" height="10" />
                          <rect x="52" y="15" width="8" height="18" />
                          <rect x="38" y="38" width="24" height="24" />
                          <rect x="44" y="44" width="12" height="12" fill="#2DD4BF" />
                          <rect x="70" y="42" width="12" height="8" />
                          <rect x="75" y="60" width="18" height="14" />
                          <rect x="38" y="72" width="14" height="18" />
                          <rect x="58" y="80" width="10" height="10" />
                        </svg>
                      </div>
                      <p className="hint" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        Total Tagihan: <strong>{formatRp(plusPrice)}</strong> · Berlaku 15 menit
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', margin: '1rem 0' }}>
                      <p className="hint" style={{ margin: 0 }}>Nomor Rekening Virtual Account BCA:</p>
                      <p style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '2px', color: '#2DD4BF', margin: '0.4rem 0' }}>
                        8000 8123 4567 890
                      </p>
                      <p className="hint" style={{ margin: 0 }}>Atas Nama: <strong>VOLTRA / {profile.businessName}</strong></p>
                      <p className="hint" style={{ marginTop: '0.5rem' }}>Total Pembayaran: <strong>{formatRp(plusPrice)}</strong></p>
                    </div>
                  )}

                  <div className="sub-checkout-actions">
                    <button
                      type="button"
                      className="sub-pricing-card__btn sub-pricing-card__btn--upgrade"
                      disabled={isVerifying}
                      onClick={handleVerifyPayment}
                    >
                      <Icon name="check" size={17} />
                      <span>{isVerifying ? 'Memverifikasi Pembayaran…' : 'Saya Sudah Bayar (Cek Status)'}</span>
                    </button>
                    <button
                      type="button"
                      className="textlink"
                      onClick={() => setCheckoutStep('method')}
                      disabled={isVerifying}
                    >
                      ← Ganti Metode Pembayaran
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
