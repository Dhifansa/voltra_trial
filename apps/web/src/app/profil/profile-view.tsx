'use client';

import { useEffect, useState } from 'react';
import { Bezel, Eyebrow, IslandButton, IslandLink } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { TARIFF_OPTIONS, TEMPLATES, getTemplate } from '@/features/kios/templates';
import { formatKwh, formatRp } from '@/lib/format';

export function ProfileView() {
  const { user, profile, kios, analytics, loginWithOtp, updateProfile } = useVoltraApp();
  const currentTpl = getTemplate(profile.templateId);

  const [isEditing, setIsEditing] = useState(false);
  const [ownerName, setOwnerName] = useState(user.ownerName);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [templateId, setTemplateId] = useState(profile.templateId);
  const [tariffId, setTariffId] = useState(profile.tariffId);
  const [billingType, setBillingType] = useState<'prepaid' | 'postpaid'>(profile.billingType);
  const [dailyVolume, setDailyVolume] = useState(String(profile.dailyVolume));
  const [address, setAddress] = useState(profile.address);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    setOwnerName(user.ownerName);
    setEmail(user.email || '');
    setPhone(user.phone);
    setBusinessName(profile.businessName);
    setTemplateId(profile.templateId);
    setTariffId(profile.tariffId);
    setBillingType(profile.billingType);
    setDailyVolume(String(profile.dailyVolume));
    setAddress(profile.address);
  }, [user, profile]);

  const selectedTpl = getTemplate(templateId);

  function handleCancelEdit() {
    setOwnerName(user.ownerName);
    setEmail(user.email || '');
    setPhone(user.phone);
    setBusinessName(profile.businessName);
    setTemplateId(profile.templateId);
    setTariffId(profile.tariffId);
    setBillingType(profile.billingType);
    setDailyVolume(String(profile.dailyVolume));
    setAddress(profile.address);
    setIsEditing(false);
  }

  function handleSave() {
    if (
      ownerName.trim() !== user.ownerName ||
      phone.trim() !== user.phone ||
      email.trim() !== (user.email || '')
    ) {
      loginWithOtp({ phone, ownerName, email });
    }
    updateProfile({
      businessName: businessName.trim() || selectedTpl.display_name,
      templateId,
      tariffId,
      billingType,
      dailyVolume: Math.max(1, Number(dailyVolume) || selectedTpl.unit.default_daily),
      address: address.trim(),
    });
    setIsEditing(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  }

  return (
    <div className="stack-gap onboarding-shell">
      {/* Kartu identitas pemilik & langganan */}
      <Bezel tone="ink" coreClassName="profile-hero">
        <div className="row-between card-head-wrap">
          <div className="profile-hero__identity">
            <span className="profile-hero__avatar">
              <Icon name="user" size={22} />
            </span>
            <div className="profile-hero__meta">
              <p className="profile-hero__name">{user.ownerName}</p>
              <p className="profile-hero__sub">
                {user.role === 'user'
                  ? `${user.email ? `${user.email} · ` : ''}${user.phone}`
                  : 'Mode Tamu · Belum klaim akun'}
              </p>
            </div>
          </div>
          <span className={`chip ${user.role === 'user' ? 'chip--high' : 'chip--mock'}`}>
            {user.authMethod === 'google'
              ? 'Google Aktif'
              : user.authMethod === 'email'
                ? 'Akun Terdaftar'
                : user.role === 'user'
                  ? 'Terverifikasi WA'
                  : 'Mode Tamu'}
          </span>
        </div>

        <div className="control__stats">
          <div>
            <span>Jenis Usaha</span>
            <strong>{currentTpl.display_name}</strong>
          </div>
          <div>
            <span>Alat di Kios</span>
            <strong>{kios.slots.length} alat</strong>
          </div>
          <div>
            <span>Paket Akun</span>
            <strong>Free Plan</strong>
          </div>
        </div>

        <div className="profile-hero__foot summary__foot">
          <span className="muted-light">
            Simulasi kios: <strong>{formatRp(analytics.kiosResult.rp_day)}/hari</strong> ({formatKwh(analytics.kiosResult.kwh_day)})
          </span>
          <div className="capture__actions">
            <IslandLink href="/langganan" variant="solid" icon="crown">
              Upgrade Plus
            </IslandLink>
            <IslandLink href="/masuk" variant="ghost" icon="phone">
              {user.role === 'user' ? 'Ganti Akun' : 'Masuk / Daftar Akun'}
            </IslandLink>
            <IslandLink href="/pengaturan" variant="ghost" icon="settings">
              Pengaturan
            </IslandLink>
          </div>
        </div>
      </Bezel>

      {/* Kartu Data Profil Usaha: Terkunci (Read-Only) secara default, klik Edit dulu untuk mengubah */}
      <Bezel coreClassName="result">
        <div className="row-between card-head-wrap">
          <Eyebrow>
            {isEditing ? 'Mode Edit · Profil & Template Usaha' : 'Rincian Profil & Template Usaha'}
          </Eyebrow>
          <div className="row-gap">
            {savedBanner && <span className="chip chip--high">Tersimpan</span>}
            {!isEditing ? (
              <button
                type="button"
                className="selected-tpl-pill"
                onClick={() => setIsEditing(true)}
              >
                <Icon name="pencil" size={13} />
                <span>Edit Profil</span>
              </button>
            ) : (
              <span className="chip chip--mock">Sedang Mengedit</span>
            )}
          </div>
        </div>

        {savedBanner && (
          <div className="notice" role="status">
            <Icon name="check" size={18} />
            <div>
              <strong>Profil usaha berhasil diperbarui!</strong> Semua alat di Kios 2D, Beranda, Biaya, dan Catat sudah
              menyesuaikan dengan <strong>{currentTpl.display_name}</strong>.
            </div>
          </div>
        )}

        {!isEditing ? (
          <>
            <ul className="entries profile-summary-list" aria-label="Ringkasan data profil usaha">
              <li>
                <span className="entries__name">
                  Nama Pemilik
                  <small>Identitas penanggung jawab usaha</small>
                </span>
                <span className="entries__val">{user.ownerName}</span>
              </li>
              <li>
                <span className="entries__name">
                  Email Akun
                  <small>Terhubung untuk login & pencadangan</small>
                </span>
                <span className="entries__val">{user.email || 'Belum diatur'}</span>
              </li>
              <li>
                <span className="entries__name">
                  Nomor WhatsApp
                  <small>Pengingat harian & verifikasi OTP</small>
                </span>
                <span className="entries__val">{user.phone}</span>
              </li>
              <li>
                <span className="entries__name">
                  Nama Usaha / Kios
                  <small>Ditampilkan pada papan nama Kios 2D</small>
                </span>
                <span className="entries__val">{profile.businessName}</span>
              </li>
              <li>
                <span className="entries__name">
                  Template Jenis Usaha
                  <small>Menentukan daftar alat di Kios 2D, Biaya, & Catat</small>
                </span>
                <span className="entries__val">{currentTpl.display_name}</span>
              </li>
              <li>
                <span className="entries__name">
                  Golongan Tarif Listrik PLN
                  <small>Dasar perhitungan {formatRp(profile.tariffRpPerKwh)}/kWh</small>
                </span>
                <span className="entries__val">{profile.tariffName}</span>
              </li>
              <li>
                <span className="entries__name">
                  Tipe Pembayaran & Volume Harian
                  <small>Rata-rata kapasitas operasional per hari</small>
                </span>
                <span className="entries__val">
                  {profile.billingType === 'prepaid' ? 'Prabayar' : 'Pascabayar'} · {profile.dailyVolume} {profile.unitLabel}
                </span>
              </li>
              <li>
                <span className="entries__name">
                  Alamat / Lokasi Usaha
                  <small>Lokasi operasional kios</small>
                </span>
                <span className="entries__val">{profile.address || 'Belum diisi'}</span>
              </li>
              <li>
                <span className="entries__name">
                  Status Paket Langganan
                  <small>Akses fitur analitik & kuota AI</small>
                </span>
                <span className="entries__val">
                  <span className="chip chip--high">Free Plan</span>
                  {' · '}
                  <IslandLink href="/langganan" variant="ghost" icon="crown">
                    Kelola Paket
                  </IslandLink>
                </span>
              </li>
            </ul>

            <div className="capture__actions">
              <IslandButton icon="pencil" onClick={() => setIsEditing(true)}>
                Edit Profil & Usaha
              </IslandButton>
              <IslandLink href="/kios" variant="ghost" icon="store">
                Lihat Kios 2D
              </IslandLink>
            </div>
          </>
        ) : (
          <>
            <div className="fields">
              <div className="field-row-2">
                <label className="field">
                  <span>Nama pemilik</span>
                  <div className="field__control">
                    <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  </div>
                </label>

                <label className="field">
                  <span>Nomor WhatsApp</span>
                  <div className="field__control">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </label>
              </div>

              <label className="field">
                <span>Email akun (Google / Email)</span>
                <div className="field__control">
                  <input
                    type="email"
                    value={email}
                    placeholder="nama@gmail.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              <label className="field">
                <span>Nama usaha / kios</span>
                <div className="field__control">
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
              </label>

              <div className="field">
                <span>Template jenis usaha (sinkron ke Kios 2D, Beranda, Biaya, & Catat)</span>
                <div className="tpl-mini-grid" role="radiogroup" aria-label="Template jenis usaha">
                  {TEMPLATES.map((t) => {
                    const active = t.template_id === templateId;
                    return (
                      <button
                        key={t.template_id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`tpl-mini ${active ? 'is-active' : ''}`}
                        onClick={() => {
                          setTemplateId(t.template_id);
                          setDailyVolume(String(t.unit.default_daily));
                        }}
                      >
                        <strong>{t.display_name}</strong>
                        <span>{t.appliances.length} alat · {t.unit.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field">
                <span>Golongan daya & tarif listrik PLN</span>
                <div className="tariff-grid" role="radiogroup" aria-label="Golongan tarif listrik PLN">
                  {TARIFF_OPTIONS.map((t) => {
                    const active = t.id === tariffId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`tariff-card ${active ? 'is-active' : ''}`}
                        onClick={() => setTariffId(t.id)}
                      >
                        <div className="tariff-card__top">
                          <strong className="tariff-card__name">{t.name.replace('/TR ', ' · ')}</strong>
                          <span className="tariff-card__rate">{formatRp(t.rate)}/kWh</span>
                        </div>
                        <span className="tariff-card__desc">{t.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field-row-2">
                <div className="field">
                  <span>Tipe pembayaran</span>
                  <div className="pillset" role="radiogroup" aria-label="Tipe pembayaran listrik">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={billingType === 'prepaid'}
                      className={billingType === 'prepaid' ? 'is-active' : ''}
                      onClick={() => setBillingType('prepaid')}
                    >
                      Prabayar
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={billingType === 'postpaid'}
                      className={billingType === 'postpaid' ? 'is-active' : ''}
                      onClick={() => setBillingType('postpaid')}
                    >
                      Pascabayar
                    </button>
                  </div>
                </div>

                <label className="field">
                  <span>Volume kerja / hari</span>
                  <div className="field__control">
                    <input
                      inputMode="numeric"
                      value={dailyVolume}
                      onChange={(e) => setDailyVolume(e.target.value)}
                    />
                    <em>{selectedTpl.unit.label}</em>
                  </div>
                </label>
              </div>

              <label className="field">
                <span>Alamat usaha</span>
                <div className="field__control">
                  <input value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </label>
            </div>

            <div className="capture__actions">
              <IslandButton icon="check" onClick={handleSave}>
                Simpan Perubahan Profil
              </IslandButton>
              <IslandButton variant="ghost" icon="close" onClick={handleCancelEdit}>
                Batal Edit
              </IslandButton>
            </div>
          </>
        )}
      </Bezel>
    </div>
  );
}
