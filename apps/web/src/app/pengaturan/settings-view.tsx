'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bezel, Eyebrow, IslandButton, IslandLink } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';

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

      {/* Pengingat Misi WhatsApp (PRD 2 §7.3) */}
      <Bezel coreClassName="result">
        <div className="row-between">
          <Eyebrow>Pengingat Misi Harian (WhatsApp)</Eyebrow>
          <button
            type="button"
            role="switch"
            aria-checked={settings.waReminder}
            aria-label="Aktifkan pengingat WhatsApp"
            className={`switch ${settings.waReminder ? 'is-on' : ''}`}
            onClick={() => updateSettings({ waReminder: !settings.waReminder })}
          >
            <span />
          </button>
        </div>
        <p className="hint">
          Maksimal 1 pengingat per hari ke nomor <strong>{user.phone}</strong> untuk foto meter tutup toko. Bisa
          dimatikan kapan saja.
        </p>

        <label className="field">
          <span>Jam pengingat harian</span>
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

      {/* Tampilan & Mode AI Gateway */}
      <Bezel coreClassName="result">
        <Eyebrow>Tampilan & Mode Simulasi</Eyebrow>

        <div className="setting-row">
          <div>
            <p className="setting-row__title">Kurangi animasi (Hemat baterai / RAM)</p>
            <p className="hint">Menonaktifkan animasi transisi & partikel pada Kios Virtual 2D (ADR-004).</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.reducedMotion}
            aria-label="Kurangi animasi"
            className={`switch ${settings.reducedMotion ? 'is-on' : ''}`}
            onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
          >
            <span />
          </button>
        </div>

        <div className="field">
          <span>Mode AI Gateway</span>
          <div className="pillset" role="radiogroup" aria-label="Mode AI Gateway">
            <button
              type="button"
              role="radio"
              aria-checked={settings.aiMode === 'mock'}
              className={settings.aiMode === 'mock' ? 'is-active' : ''}
              onClick={() => updateSettings({ aiMode: 'mock' })}
            >
              Mock (Contoh)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.aiMode === 'hybrid'}
              className={settings.aiMode === 'hybrid' ? 'is-active' : ''}
              onClick={() => updateSettings({ aiMode: 'hybrid' })}
            >
              Hybrid
            </button>
          </div>
        </div>
      </Bezel>

      {/* Privasi & Kendali Data (PRD 1 §2) */}
      <Bezel coreClassName="result">
        <div className="row-between">
          <Eyebrow>Privasi & Kendali Data</Eyebrow>
          <span className="chip">Consent {user.consentVersion}</span>
        </div>
        <p className="hint">
          Foto, suara, dan profil usaha (<strong>{profile.businessName}</strong> · {kios.slots.length} alat di{' '}
          {template.display_name}) adalah milik Anda. Anda dapat mereset simulasi atau menghapus seluruh data kapan
          saja.
        </p>

        <div className="capture__actions">
          <IslandButton
            variant="ghost"
            icon="retry"
            onClick={() => {
              selectTemplate(profile.templateId, profile.businessName);
              showNotice(`Alat di Kios 2D dikembalikan ke bawaan ${template.display_name}.`);
            }}
          >
            Reset Alat Kios ke Awal
          </IslandButton>

          <IslandLink href="/profil" variant="ghost" icon="user">
            Edit Profil Usaha
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
            Keluar Akun
          </IslandButton>
          <IslandButton
            variant="ghost"
            icon="trash"
            onClick={() => {
              resetAllData();
              router.push('/masuk');
            }}
          >
            Hapus Data & Mulai Ulang
          </IslandButton>
        </div>
      </Bezel>
    </div>
  );
}

