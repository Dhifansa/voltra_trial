'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Bezel, Eyebrow, IslandButton } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { ApplianceArt } from '@/features/kios/appliance-art';
import {
  TARIFF_OPTIONS,
  TEMPLATES,
  TEMPLATE_META,
  getTemplate,
} from '@/features/kios/templates';
import { formatRp } from '@/lib/format';

type Step = 'login' | 'otp' | 'profiling';
type AuthMode = 'signin' | 'register';

const GOOGLE_ACCOUNTS = [
  { name: 'Bu Sari', email: 'busari.umkm@gmail.com', note: 'Akun Google Utama' },
  { name: 'Pak Budi Santoso', email: 'budi.usaha@gmail.com', note: 'Akun Bisnis UMKM' },
];

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="google-btn__logo">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const {
    user,
    profile,
    loginWithOtp,
    loginWithGoogle,
    registerAccount,
    continueAsGuest,
    saveProfiling,
  } = useVoltraApp();

  const [step, setStep] = useState<Step>('login');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [profileTask, setProfileTask] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'plus'>('free');
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  const cardRef = useRef<HTMLDivElement>(null);

  const [ownerName, setOwnerName] = useState(user.ownerName || 'Bu Sari');
  const [email, setEmail] = useState(user.email || 'busari.umkm@gmail.com');
  const [phone, setPhone] = useState(user.phone || '+62 812-3456-7890');
  const [password, setPassword] = useState('voltra123');
  const [consent, setConsent] = useState(true);
  const [otp, setOtp] = useState('123456');

  const [templateId, setTemplateId] = useState(profile.templateId || 'laundry');
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [tariffId, setTariffId] = useState(profile.tariffId || 'rate_b1_2200');
  const [billingType, setBillingType] = useState<'prepaid' | 'postpaid'>(
    profile.billingType || 'prepaid',
  );
  const [dailyVolume, setDailyVolume] = useState(String(profile.dailyVolume || 50));
  const [address, setAddress] = useState(profile.address || '');

  const selectedTemplate = getTemplate(templateId);

  function scrollCardIntoView() {
    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  function advanceToProfiling(defaultOwner: string) {
    if (!businessName.trim()) {
      setBusinessName(`${selectedTemplate.display_name} ${defaultOwner.trim() || 'Kita'}`);
    }
    setShowGooglePicker(false);
    setStep('profiling');
    setProfileTask(1);
    setMaxStepReached((prev) => Math.max(prev, 2));
    scrollCardIntoView();
  }

  function handleSelectTemplate(id: string) {
    const tpl = getTemplate(id);
    setTemplateId(id);
    setDailyVolume(String(tpl.unit.default_daily));
    if (
      !businessName.trim() ||
      TEMPLATES.some((t) => businessName.startsWith(t.display_name))
    ) {
      setBusinessName(`${tpl.display_name} ${ownerName.trim() || 'Kita'}`);
    }
    setProfileTask(2);
    setMaxStepReached((prev) => Math.max(prev, 3));
    scrollCardIntoView();
  }

  function handleNormalSignIn() {
    if (!email.trim() && !phone.trim()) return;
    registerAccount({
      ownerName: ownerName.trim() || 'Bu Sari',
      email: email.trim() || 'busari.umkm@gmail.com',
      phone: phone.trim() || '+62 812-3456-7890',
    });
    advanceToProfiling(ownerName);
  }

  function handleSendOtp() {
    if (!phone.trim()) return;
    setStep('otp');
    scrollCardIntoView();
  }

  function handleVerifyOtp() {
    if (otp.trim().length < 4) return;
    loginWithOtp({ phone, ownerName, email });
    advanceToProfiling(ownerName);
  }

  function handleCreateAccount() {
    if (!consent || !ownerName.trim() || !email.trim() || !phone.trim()) return;
    registerAccount({ ownerName, email, phone });
    advanceToProfiling(ownerName);
  }

  function handleGoogleSignIn(account?: { name: string; email: string }) {
    const chosenName = account?.name || ownerName || 'Bu Sari';
    const chosenEmail = account?.email || email || 'busari.umkm@gmail.com';
    setOwnerName(chosenName);
    setEmail(chosenEmail);
    loginWithGoogle({ ownerName: chosenName, email: chosenEmail });
    advanceToProfiling(chosenName);
  }

  function handleGuest() {
    continueAsGuest(ownerName);
    advanceToProfiling(ownerName);
  }

  function handleFinishProfiling(planToSave?: 'free' | 'plus') {
    const finalPlan = planToSave || selectedPlan;
    saveProfiling({
      businessName:
        businessName.trim() || `${selectedTemplate.display_name} ${ownerName.trim() || 'Kita'}`,
      templateId,
      tariffId,
      billingType,
      dailyVolume: Number(dailyVolume) || selectedTemplate.unit.default_daily,
      address: address.trim(),
      subscriptionPlan: finalPlan,
    });
    router.push('/kios');
  }

  function handleJumpToStep(targetStep: 1 | 2 | 3 | 4) {
    // Pengguna hanya bisa kembali ke langkah yang sudah dibuka/diselesaikan, tidak bisa loncat bebas ke langkah depan
    if (targetStep > maxStepReached) return;

    if (targetStep === 1) {
      setStep('login');
    } else if (targetStep === 2) {
      setStep('profiling');
      setProfileTask(1);
    } else if (targetStep === 3) {
      setStep('profiling');
      setProfileTask(2);
    } else if (targetStep === 4) {
      setStep('profiling');
      setProfileTask(3);
    }
    scrollCardIntoView();
  }

  const activeStepNum =
    step === 'login' || step === 'otp'
      ? 1
      : profileTask === 1
        ? 2
        : profileTask === 2
          ? 3
          : 4;

  return (
    <div className="stack-gap onboarding-shell">
      {/* Stepper terarah & terkontrol: hanya langkah yang sudah selesai/terbuka yang bisa diklik kembali */}
      <div className="stepper" aria-label="Tahap pengenalan">
        <button
          type="button"
          className={`stepper__item ${activeStepNum === 1 ? 'is-active' : 'is-done'}`}
          onClick={() => handleJumpToStep(1)}
          title="Langkah 1: Masuk"
          aria-current={activeStepNum === 1 ? 'step' : undefined}
        >
          <span className="stepper__num">1</span>
          <span className="stepper__label">Masuk</span>
        </button>
        <span className={`stepper__line ${activeStepNum > 1 ? 'is-done' : ''}`} />
        <button
          type="button"
          disabled={maxStepReached < 2}
          className={`stepper__item ${
            activeStepNum === 2 ? 'is-active' : activeStepNum > 2 ? 'is-done' : ''
          } ${maxStepReached < 2 ? 'is-disabled' : ''}`}
          onClick={() => handleJumpToStep(2)}
          title={maxStepReached < 2 ? 'Selesaikan Langkah 1 terlebih dahulu' : 'Langkah 2: Pilih Kios'}
          aria-current={activeStepNum === 2 ? 'step' : undefined}
          aria-disabled={maxStepReached < 2}
        >
          <span className="stepper__num">2</span>
          <span className="stepper__label">
            <span className="stepper__label-long">Pilih </span>Kios
          </span>
        </button>
        <span className={`stepper__line ${activeStepNum > 2 ? 'is-done' : ''}`} />
        <button
          type="button"
          disabled={maxStepReached < 3}
          className={`stepper__item ${
            activeStepNum === 3 ? 'is-active' : activeStepNum > 3 ? 'is-done' : ''
          } ${maxStepReached < 3 ? 'is-disabled' : ''}`}
          onClick={() => handleJumpToStep(3)}
          title={maxStepReached < 3 ? 'Selesaikan langkah sebelumnya terlebih dahulu' : 'Langkah 3: Tarif PLN'}
          aria-current={activeStepNum === 3 ? 'step' : undefined}
          aria-disabled={maxStepReached < 3}
        >
          <span className="stepper__num">3</span>
          <span className="stepper__label">
            Tarif<span className="stepper__label-long"> PLN</span>
          </span>
        </button>
        <span className={`stepper__line ${activeStepNum > 3 ? 'is-done' : ''}`} />
        <button
          type="button"
          disabled={maxStepReached < 4}
          className={`stepper__item ${activeStepNum === 4 ? 'is-active' : ''} ${
            maxStepReached < 4 ? 'is-disabled' : ''
          }`}
          onClick={() => handleJumpToStep(4)}
          title={maxStepReached < 4 ? 'Selesaikan langkah sebelumnya terlebih dahulu' : 'Langkah 4: Pilih Paket'}
          aria-current={activeStepNum === 4 ? 'step' : undefined}
          aria-disabled={maxStepReached < 4}
        >
          <span className="stepper__num">4</span>
          <span className="stepper__label">
            <span className="stepper__label-long">Pilih </span>Paket
          </span>
        </button>
      </div>

      {/* LANGKAH 1A: LOGIN BIASA, CREATE ACCOUNT, & GOOGLE SIGN-IN */}
      {step === 'login' && (
        <div ref={cardRef}>
          <Bezel coreClassName="result">
            <div className="row-between card-head-wrap">
              <Eyebrow>
                {authMode === 'signin'
                  ? 'Masuk ke Akun Voltra'
                  : 'Buat Akun Baru (Create Account)'}
              </Eyebrow>
              <span className="chip">{authMode === 'signin' ? 'Login' : 'Daftar'}</span>
            </div>

            {/* Tab Masuk Akun vs Buat Akun Baru */}
            <div className="pillset" role="tablist" aria-label="Pilih mode autentikasi">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'signin'}
                className={authMode === 'signin' ? 'is-active' : ''}
                onClick={() => {
                  setAuthMode('signin');
                  setShowGooglePicker(false);
                }}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'register'}
                className={authMode === 'register' ? 'is-active' : ''}
                onClick={() => {
                  setAuthMode('register');
                  setShowGooglePicker(false);
                }}
              >
                Buat Akun Baru
              </button>
            </div>

            {/* Tombol Utama: Menggunakan Google */}
            <div className="google-auth-box">
              <button
                type="button"
                className="google-btn"
                onClick={() => setShowGooglePicker((v) => !v)}
              >
                <GoogleLogo />
                <span>
                  {authMode === 'signin'
                    ? 'Masuk menggunakan Google'
                    : 'Daftar menggunakan Google'}
                </span>
              </button>

              {showGooglePicker && (
                <div className="google-picker" role="region" aria-label="Pilih akun Google">
                  <p className="google-picker__title">Pilih akun Google untuk melanjutkan:</p>
                  <div className="google-picker__list">
                    {GOOGLE_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        className="google-picker__item"
                        onClick={() => handleGoogleSignIn(acc)}
                      >
                        <span className="google-picker__avatar">
                          {acc.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="google-picker__info">
                          <strong>{acc.name}</strong>
                          <small>{acc.email}</small>
                        </span>
                        <span className="chip chip--high">{acc.note}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="google-picker__custom"
                    onClick={() => handleGoogleSignIn({ name: ownerName, email })}
                  >
                    Lanjutkan sebagai <strong>{email || 'busari.umkm@gmail.com'}</strong> →
                  </button>
                </div>
              )}
            </div>

            <div className="auth-divider" aria-hidden="true">
              <span>
                {authMode === 'signin'
                  ? 'atau masuk dengan email / WhatsApp'
                  : 'atau isi formulir pendaftaran'}
              </span>
            </div>

            {authMode === 'signin' ? (
              <>
                <div className="fields">
                  <label className="field">
                    <span>Email atau Nomor WhatsApp</span>
                    <div className="field__control">
                      <input
                        value={email}
                        placeholder="nama@gmail.com atau +62 812..."
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </label>

                  <label className="field">
                    <span>Kata sandi</span>
                    <div className="field__control">
                      <input
                        type="password"
                        value={password}
                        placeholder="Masukkan kata sandi"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                <div className="capture__actions">
                  <IslandButton
                    icon="arrow"
                    disabled={!email.trim() || password.length < 4}
                    onClick={handleNormalSignIn}
                  >
                    Masuk ke Akun
                  </IslandButton>
                  <IslandButton
                    variant="ghost"
                    icon="phone"
                    onClick={handleSendOtp}
                  >
                    Masuk via OTP WhatsApp
                  </IslandButton>
                  <IslandButton variant="ghost" icon="user" onClick={handleGuest}>
                    Masuk sebagai Tamu
                  </IslandButton>
                </div>

                <p className="auth-switch-hint">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    className="textlink"
                    onClick={() => setAuthMode('register')}
                  >
                    Buat Akun Baru (Create Account)
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="fields">
                  <label className="field">
                    <span>Nama lengkap pemilik usaha</span>
                    <div className="field__control">
                      <input
                        value={ownerName}
                        placeholder="Mis. Siti Sari"
                        onChange={(e) => setOwnerName(e.target.value)}
                      />
                    </div>
                  </label>

                  <div className="field-row-2">
                    <label className="field">
                      <span>Alamat Email</span>
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
                      <span>Nomor WhatsApp</span>
                      <div className="field__control">
                        <input
                          type="tel"
                          value={phone}
                          placeholder="+62 812-3456-7890"
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </label>
                  </div>

                  <label className="field">
                    <span>Buat kata sandi (minimal 6 karakter)</span>
                    <div className="field__control">
                      <input
                        type="password"
                        value={password}
                        placeholder="Minimal 6 karakter"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Saya menyetujui pembuatan akun baru serta kebijakan privasi penyimpanan data usaha Voltra (<code>v1.0</code>).
                  </span>
                </label>

                <div className="capture__actions">
                  <IslandButton
                    icon="check"
                    disabled={
                      !consent ||
                      !ownerName.trim() ||
                      !email.trim() ||
                      !phone.trim() ||
                      password.length < 4
                    }
                    onClick={handleCreateAccount}
                  >
                    Buat Akun Sekarang
                  </IslandButton>
                </div>

                <p className="auth-switch-hint">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    className="textlink"
                    onClick={() => setAuthMode('signin')}
                  >
                    Masuk ke Akun
                  </button>
                </p>
              </>
            )}
          </Bezel>
        </div>
      )}

      {/* LANGKAH 1B: OTP */}
      {step === 'otp' && (
        <div ref={cardRef}>
          <Bezel coreClassName="result">
            <div className="row-between card-head-wrap">
              <Eyebrow>Verifikasi Nomor WhatsApp</Eyebrow>
              <span className="chip chip--high">Terkirim</span>
            </div>
            <p className="hint">
              Kode OTP 6 digit telah dikirim ke <strong>{phone}</strong>. Untuk mode simulasi, gunakan kode <code>123456</code>.
            </p>

            <label className="field">
              <span>Kode OTP (6 digit)</span>
              <div className="field__control">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  placeholder="123456"
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </label>

            <div className="capture__actions">
              <IslandButton
                icon="check"
                disabled={otp.trim().length < 4}
                onClick={handleVerifyOtp}
              >
                Verifikasi & Lanjut Profiling
              </IslandButton>
              <IslandButton variant="ghost" icon="retry" onClick={() => setStep('login')}>
                Kembali ke Login
              </IslandButton>
            </div>
          </Bezel>
        </div>
      )}

      {/* LANGKAH 2: PILIH TEMPLATE JENIS USAHA */}
      {step === 'profiling' && profileTask === 1 && (
        <div ref={cardRef}>
          <Bezel coreClassName="result">
            <div className="row-between card-head-wrap">
              <Eyebrow>Langkah 2 · Pilih Jenis Usaha</Eyebrow>
              <span className="chip chip--high">{selectedTemplate.appliances.length} alat bawaan</span>
            </div>
            <p className="hint">
              Ketuk salah satu template di bawah. Pilihan ini otomatis mengatur alat di <strong>Kios 2D</strong>, <strong>Biaya</strong>, <strong>Beranda</strong>, dan <strong>Catat</strong>.
            </p>

            <ol className="tpl-grid" role="radiogroup" aria-label="Pilih template jenis usaha">
              {TEMPLATES.map((t) => {
                const active = t.template_id === templateId;
                return (
                  <li key={t.template_id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`tpl ${active ? 'is-active' : ''}`}
                      onClick={() => handleSelectTemplate(t.template_id)}
                    >
                      <span className="tpl__art">
                        {t.appliances.slice(0, 3).map((a) => (
                          <span key={a.id}>
                            <ApplianceArt icon={a.icon} on />
                          </span>
                        ))}
                      </span>
                      <span className="tpl__body">
                        <span className="tpl__name">{t.display_name}</span>
                        <span className="tpl__blurb">{TEMPLATE_META[t.template_id]?.blurb}</span>
                      </span>
                      <span className="tpl__check" aria-hidden="true">
                        {active && <Icon name="check" size={14} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="capture__actions">
              <IslandButton
                icon="arrow"
                onClick={() => {
                  setProfileTask(2);
                  setMaxStepReached((prev) => Math.max(prev, 3));
                  scrollCardIntoView();
                }}
              >
                Lanjut Atur Tarif ({selectedTemplate.display_name})
              </IslandButton>
              <IslandButton
                variant="ghost"
                icon="retry"
                onClick={() => {
                  setStep('login');
                  scrollCardIntoView();
                }}
              >
                Kembali ke Masuk
              </IslandButton>
            </div>
          </Bezel>
        </div>
      )}

      {/* LANGKAH 3: DETAIL PROFIL & TARIF LISTRIK USAHA */}
      {step === 'profiling' && profileTask === 2 && (
        <div ref={cardRef}>
          <Bezel coreClassName="result">
            <div className="row-between card-head-wrap">
              <Eyebrow>Langkah 3 · Detail & Tarif PLN</Eyebrow>
              <button
                type="button"
                className="selected-tpl-pill"
                onClick={() => {
                  setProfileTask(1);
                  scrollCardIntoView();
                }}
              >
                <span>{selectedTemplate.display_name}</span>
                <em>Ubah</em>
              </button>
            </div>

            <div className="fields">
              <label className="field">
                <span>Nama usaha / kios</span>
                <div className="field__control">
                  <input
                    value={businessName}
                    placeholder={`Mis. ${selectedTemplate.display_name} ${ownerName}`}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </label>

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
                    <em>{selectedTemplate.unit.label}</em>
                  </div>
                </label>
              </div>

              <label className="field">
                <span>Alamat / lokasi singkat (opsional)</span>
                <div className="field__control">
                  <input
                    value={address}
                    placeholder="Mis. Sekaran, Gunungpati, Semarang"
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="capture__actions">
              <IslandButton
                icon="arrow"
                onClick={() => {
                  setProfileTask(3);
                  setMaxStepReached((prev) => Math.max(prev, 4));
                  scrollCardIntoView();
                }}
              >
                Lanjut ke Pilihan Paket ({selectedTemplate.display_name})
              </IslandButton>
              <IslandButton
                variant="ghost"
                icon="retry"
                onClick={() => {
                  setProfileTask(1);
                  scrollCardIntoView();
                }}
              >
                Kembali ke Pilih Kios
              </IslandButton>
            </div>
          </Bezel>
        </div>
      )}

      {/* LANGKAH 4: PILIH PAKET LANGGANAN (FREE TRIAL 30 HARI VS PLUS AKSES SEMUA FITUR) */}
      {step === 'profiling' && profileTask === 3 && (
        <div ref={cardRef}>
          <Bezel coreClassName="result">
            <div className="row-between card-head-wrap">
              <Eyebrow>Langkah 4 · Pilih Paket Langganan</Eyebrow>
              <button
                type="button"
                className="selected-tpl-pill"
                onClick={() => {
                  setProfileTask(2);
                  setMaxStepReached((prev) => Math.max(prev, 3));
                  scrollCardIntoView();
                }}
                title="Kembali ke langkah sebelumnya (Tarif PLN)"
              >
                <span>← Kembali ke Tarif PLN</span>
              </button>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.6rem', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
              Pilih Paket untuk {businessName || selectedTemplate.display_name}
            </h3>
            <p className="hint">
              Pilih <strong>Free (Trial 30 Hari)</strong> untuk mencoba fitur dasar simulasi, atau aktifkan <strong>Voltra Plus</strong> agar langsung bisa mengakses seluruh fitur canggih tanpa batas.
            </p>

            <div className="onboarding-plans-grid" role="radiogroup" aria-label="Pilih paket langganan">
              {/* OPSI 1: FREE (TRIAL 30 HARI) */}
              <div
                role="radio"
                tabIndex={0}
                aria-checked={selectedPlan === 'free'}
                className={`onboarding-plan-card onboarding-plan-card--free ${selectedPlan === 'free' ? 'is-selected' : ''}`}
                onClick={() => setSelectedPlan('free')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedPlan('free')}
              >
                <div>
                  <div className="onboarding-plan-card__badge-row">
                    <span className="onboarding-plan-card__name">Free Plan</span>
                    <span className="onboarding-plan-card__badge onboarding-plan-card__badge--free">Trial 30 Hari</span>
                  </div>
                  <p className="onboarding-plan-card__desc">
                    Uji coba gratis seluruh fitur simulasi dan kalkulasi energi dasar selama 30 hari ke depan tanpa biaya.
                  </p>
                  <div className="onboarding-plan-card__pricing">
                    <span className="onboarding-plan-card__amount">Rp 0</span>
                    <span className="onboarding-plan-card__period">/ 30 hari pertama</span>
                  </div>
                  <ul className="onboarding-plan-card__features" aria-label="Fitur Free Trial">
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check"><Icon name="check" size={12} /></span>
                      <span><strong>Trial 30 Hari</strong> akses penuh uji coba</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check"><Icon name="check" size={12} /></span>
                      <span>Simulasi Kios Virtual 2D interaktif</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check"><Icon name="check" size={12} /></span>
                      <span>Kalkulasi biaya energi listrik per alat</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check"><Icon name="check" size={12} /></span>
                      <span>Catat meteran mandiri harian</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check"><Icon name="check" size={12} /></span>
                      <span>3 rekomendasi efisiensi daya dasar</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  className={`onboarding-plan-card__btn onboarding-plan-card__btn--free ${selectedPlan === 'free' ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedPlan === 'free') {
                      handleFinishProfiling('free');
                    } else {
                      setSelectedPlan('free');
                    }
                  }}
                  title={selectedPlan === 'free' ? 'Klik untuk langsung membuka Kios 2D' : 'Pilih paket Free'}
                >
                  {selectedPlan === 'free' ? '✓ Paket Terpilih · Lanjut Buka Kios →' : 'Pilih Free (Trial 30 Hari)'}
                </button>
              </div>

              {/* OPSI 2: VOLTRA PLUS (LANGSUNG AKSES SEMUA FITUR) */}
              <div
                role="radio"
                tabIndex={0}
                aria-checked={selectedPlan === 'plus'}
                className={`onboarding-plan-card onboarding-plan-card--plus ${selectedPlan === 'plus' ? 'is-selected' : ''}`}
                onClick={() => setSelectedPlan('plus')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedPlan('plus')}
              >
                <div>
                  <div className="onboarding-plan-card__badge-row">
                    <div className="onboarding-plan-card__title-row">
                      <Icon name="crown" size={18} className="onboarding-plan-card__crown" />
                      <span className="onboarding-plan-card__name">Voltra Plus</span>
                    </div>
                    <span className="onboarding-plan-card__badge onboarding-plan-card__badge--plus">Rekomendasi · Akses Penuh</span>
                  </div>
                  <p className="onboarding-plan-card__desc">
                    Langsung buka semua fitur canggih tanpa batasan kuota untuk efisiensi bisnis maksimal.
                  </p>
                  <div className="onboarding-plan-card__pricing">
                    <span className="onboarding-plan-card__amount" style={{ color: '#2DD4BF' }}>Rp 19.000</span>
                    <span className="onboarding-plan-card__period">/ bulan</span>
                  </div>
                  <ul className="onboarding-plan-card__features" aria-label="Fitur Voltra Plus">
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check is-plus"><Icon name="bolt" size={12} /></span>
                      <span style={{ color: '#2DD4BF', fontWeight: 700 }}>⚡ Langsung Akses Semua Fitur</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check is-plus"><Icon name="check" size={12} /></span>
                      <span>Tanpa batas durasi trial (Full Access)</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check is-plus"><Icon name="check" size={12} /></span>
                      <span>AI OCR Foto Meteran Listrik otomatis</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check is-plus"><Icon name="check" size={12} /></span>
                      <span>AI Voice Input & Asisten Terra AI tanpa kuota</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check is-plus"><Icon name="check" size={12} /></span>
                      <span>Ekspor laporan PDF & Excel akuntansi lengkap</span>
                    </li>
                    <li className="onboarding-plan-card__feature-item">
                      <span className="onboarding-plan-card__check is-plus"><Icon name="check" size={12} /></span>
                      <span>Pengingat WhatsApp harian otomatis terjadwal</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  className={`onboarding-plan-card__btn onboarding-plan-card__btn--plus ${selectedPlan === 'plus' ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedPlan === 'plus') {
                      handleFinishProfiling('plus');
                    } else {
                      setSelectedPlan('plus');
                    }
                  }}
                  title={selectedPlan === 'plus' ? 'Klik untuk langsung membuka Kios 2D' : 'Pilih paket Voltra Plus'}
                >
                  {selectedPlan === 'plus' ? '✓ Paket Terpilih · Lanjut Buka Kios →' : 'Pilih Plus (Akses Semua Fitur)'}
                </button>
              </div>
            </div>

            {/* Notice ringkasan paket terpilih */}
            {selectedPlan === 'free' ? (
              <div className="notice" role="status">
                <Icon name="info" size={18} />
                <div>
                  <strong>Free (Trial 30 Hari) Aktif:</strong> Anda mendapatkan akses uji coba 30 hari gratis untuk simulasi Kios 2D dan perhitungan energi dasar. Tanpa kartu kredit.
                </div>
              </div>
            ) : (
              <div className="notice" role="status" style={{ background: 'rgba(45, 212, 191, 0.1)', borderColor: 'rgba(45, 212, 191, 0.3)' }}>
                <Icon name="crown" size={18} style={{ color: '#2DD4BF' }} />
                <div>
                  <strong>Voltra Plus Aktif:</strong> Anda langsung membuka seluruh fitur premium tanpa batas: AI OCR, suara Wati, analitik multi-skenario, dan ekspor laporan.
                </div>
              </div>
            )}

            <div className="capture__actions" style={{ marginTop: '1.25rem' }}>
              <IslandButton
                icon="store"
                onClick={() => handleFinishProfiling(selectedPlan)}
              >
                Lanjut Buka Kios 2D ({selectedPlan === 'plus' ? 'Paket Plus · Akses Penuh' : 'Free · Trial 30 Hari'}) →
              </IslandButton>
              <IslandButton
                variant="ghost"
                icon="retry"
                onClick={() => {
                  setProfileTask(2);
                  setMaxStepReached((prev) => Math.max(prev, 3));
                  scrollCardIntoView();
                }}
              >
                Kembali ke Tarif PLN
              </IslandButton>
            </div>
          </Bezel>
        </div>
      )}
    </div>
  );
}
