'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bezel, Eyebrow, IslandButton, IslandLink } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import { getDictionary } from '@/lib/i18n';

export function SettingsView() {
  const router = useRouter();
  const {
    user,
    profile,
    kios,
    settings,
    updateSettings,
    selectTemplate,
    logout,
    resetAllData,
  } = useVoltraApp();
  const template = getTemplate(profile.templateId);
  const [notice, setNotice] = useState<string | null>(null);
  const [showWaPreview, setShowWaPreview] = useState(false);
  const [isSendingWa, setIsSendingWa] = useState(false);
  const currentLang = settings.language || 'id';
  const t = getDictionary(currentLang);

  function showNotice(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  }

  function handleTestWhatsApp() {
    setIsSendingWa(true);
    setTimeout(() => {
      setIsSendingWa(false);
      setShowWaPreview(true);
    }, 800);
  }

  return (
    <div className="stack-gap">
      {notice && (
        <div className="notice" role="status">
          <Icon name="check" size={18} />
          <div>{notice}</div>
        </div>
      )}

      {/* Pilihan Bahasa Tampilan (Language Selector) */}
      <Bezel coreClassName="result">
        <Eyebrow>{t.settings.languageTitle}</Eyebrow>
        <p className="hint">{t.settings.languageHint}</p>
        <div className="pillset" role="radiogroup" aria-label={t.settings.languageTitle}>
          <button
            type="button"
            role="radio"
            aria-checked={currentLang === 'id'}
            className={currentLang === 'id' ? 'is-active' : ''}
            onClick={() => {
              updateSettings({ language: 'id' });
              showNotice('Bahasa berhasil diubah ke Bahasa Indonesia.');
            }}
          >
            {t.settings.langId}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={currentLang === 'en'}
            className={currentLang === 'en' ? 'is-active' : ''}
            onClick={() => {
              updateSettings({ language: 'en' });
              showNotice('Language successfully changed to English.');
            }}
          >
            {t.settings.langEn}
          </button>
        </div>
      </Bezel>

      {/* Paket Langganan & Membership */}
      <Bezel coreClassName="result">
        <div className="row-between">
          <Eyebrow>{t.menu.subscription}</Eyebrow>
          <span className={`chip ${profile.subscriptionPlan === 'plus' ? 'chip--high' : 'chip--mock'}`}>
            {profile.subscriptionPlan === 'plus'
              ? 'Plus Plan (Aktif)'
              : `Free Trial (${profile.trialDaysLeft} hari)`}
          </span>
        </div>
        <p className="hint">
          {profile.subscriptionPlan === 'plus'
            ? currentLang === 'id'
              ? 'Akun Anda aktif pada paket Voltra Plus dengan akses penuh ke seluruh fitur dan ekspor laporan.'
              : 'Your account is active on Voltra Plus with full access to all features and report exports.'
            : currentLang === 'id'
              ? 'Akun Anda aktif pada paket Free Trial. Tingkatkan ke Voltra Plus untuk analitik mendalam dan kuota foto tanpa batas.'
              : 'Your account is active on the Free plan trial. Upgrade to Voltra Plus for in-depth analytics and unlimited quota.'}
        </p>
        <div className="capture__actions">
          <IslandLink href="/langganan" variant="solid" icon="crown">
            {profile.subscriptionPlan === 'plus'
              ? currentLang === 'id'
                ? 'Kelola Paket Langganan'
                : 'Manage Subscription'
              : currentLang === 'id'
                ? 'Lihat Pilihan Paket'
                : 'View Subscription Plans'}
          </IslandLink>
        </div>
      </Bezel>

      {/* Pengingat Misi WhatsApp */}
      <Bezel coreClassName="result">
        <div className="row-between">
          <Eyebrow>{t.settings.waTitle}</Eyebrow>
          <button
            type="button"
            role="switch"
            aria-checked={settings.waReminder}
            aria-label={t.settings.waTitle}
            className={`switch ${settings.waReminder ? 'is-on' : ''}`}
            onClick={() => updateSettings({ waReminder: !settings.waReminder })}
          >
            <span />
          </button>
        </div>
        <p className="hint">
          {t.settings.waHint.replace('{phone}', user.phone)}
        </p>

        <label className="field">
          <span>{t.settings.reminderTime}</span>
          <div className="field__control field__control--sm">
            <input
              type="time"
              disabled={!settings.waReminder}
              value={settings.reminderTime}
              onChange={(e) => updateSettings({ reminderTime: e.target.value })}
            />
          </div>
        </label>

        <div className="capture__actions" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="selected-tpl-pill"
            disabled={!settings.waReminder || isSendingWa}
            onClick={handleTestWhatsApp}
            title="Kirim pesan simulasi bot WhatsApp ke nomor Anda"
          >
            <Icon name="phone" size={13} />
            <span>{isSendingWa ? 'Mengirim pesan…' : 'Uji Kirim Pengingat WhatsApp'}</span>
          </button>
        </div>
      </Bezel>

      {/* Tampilan */}
      <Bezel coreClassName="result">
        <Eyebrow>{t.settings.displayTitle}</Eyebrow>

        <div className="setting-row">
          <div>
            <p className="setting-row__title">{t.settings.reducedMotionTitle}</p>
            <p className="hint">{t.settings.reducedMotionHint}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.reducedMotion}
            aria-label={t.settings.reducedMotionTitle}
            className={`switch ${settings.reducedMotion ? 'is-on' : ''}`}
            onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
          >
            <span />
          </button>
        </div>
      </Bezel>

      {/* Privasi & Kendali Data */}
      <Bezel coreClassName="result">
        <div className="row-between">
          <Eyebrow>{t.settings.privacyTitle}</Eyebrow>
          <span className="chip">{t.settings.privacyConsent} {user.consentVersion}</span>
        </div>
        <p className="hint">
          {t.settings.privacyHint
            .replace('{business}', profile.businessName)
            .replace('{count}', String(kios.slots.length))
            .replace('{template}', template.display_name)}
        </p>

        <div className="capture__actions">
          <IslandButton
            variant="ghost"
            icon="retry"
            onClick={() => {
              selectTemplate(profile.templateId, profile.businessName);
              showNotice(t.settings.resetNotice.replace('{template}', template.display_name));
            }}
          >
            {t.settings.resetKiosk}
          </IslandButton>

          <IslandLink href="/profil" variant="ghost" icon="user">
            {t.settings.editProfile}
          </IslandLink>
        </div>

        <div className="setting-danger">
          <IslandButton
            variant="ghost"
            icon="logout"
            onClick={() => {
              logout();
              router.push('/masuk');
            }}
          >
            {t.settings.logout}
          </IslandButton>
          <IslandButton
            variant="ghost"
            icon="trash"
            onClick={() => {
              resetAllData();
              router.push('/masuk');
            }}
          >
            {t.settings.deleteData}
          </IslandButton>
        </div>
      </Bezel>

      {/* MODAL SIMULASI NOTIFIKASI WHATSAPP */}
      {showWaPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="kios-modal-backdrop"
          onClick={() => setShowWaPreview(false)}
        >
          <div
            className="kios-modal"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
              <div className="row-gap">
                <span style={{ fontSize: '1.25rem' }}>💬</span>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>WhatsApp Official Bot</strong>
                  <p className="hint" style={{ fontSize: '0.75rem', margin: 0 }}>Terkirim ke: {user.phone}</p>
                </div>
              </div>
              <span className="chip chip--high" style={{ fontSize: '0.7rem' }}>Terverifikasi</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '1rem', borderLeft: '3px solid #25D366', marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#25D366', fontSize: '0.85rem' }}>
                [Voltess Energy Assistant]
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                Halo <strong>{user.ownerName}</strong>! ⚡<br /><br />
                Waktu tutup operasional usaha <strong>{profile.businessName}</strong> telah tiba ({settings.reminderTime} WIB).
                Jangan lupa ambil 1 foto meteran listrik malam ini di Voltess agar kalkulasi tagihan kemarin tercatat presisi dan rekomendasi penghematan besok pagi dapat dihitung otomatis!
              </p>
              <span className="hint" style={{ display: 'block', textAlign: 'right', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                {settings.reminderTime} WIB · Terbaca ✓✓
              </span>
            </div>

            <div className="capture__actions">
              <IslandLink href="/catat" icon="capture" onClick={() => setShowWaPreview(false)}>
                Buka Catat Sekarang
              </IslandLink>
              <IslandButton variant="ghost" icon="close" onClick={() => setShowWaPreview(false)}>
                Tutup
              </IslandButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

