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
  const currentLang = settings.language || 'id';
  const t = getDictionary(currentLang);

  function showNotice(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
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
    </div>
  );
}

