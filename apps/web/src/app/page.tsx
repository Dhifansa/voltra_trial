'use client';

import { useState } from 'react';
import { Bezel, ConfidenceBadge, Eyebrow, IslandLink, MockBadge, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { TerraAvatar } from '@/components/ui/terra-mascot';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import { formatKwh, formatRp } from '@/lib/format';
import { getDictionary } from '@/lib/i18n';

export default function HomePage() {
  const { user, profile, analytics, settings } = useVoltraApp();
  const template = getTemplate(profile.templateId);
  const t = getDictionary(settings.language || 'id');
  const isEn = settings.language === 'en';
  const [appliedHomeRec, setAppliedHomeRec] = useState(false);
  const [homeNotice, setHomeNotice] = useState<string | null>(null);

  const hasTwoRecords = (profile.recordCount ?? 1) >= 2;

  const missionSteps = [
    { label: isEn ? 'Morning meter photo' : 'Foto meter pagi', done: true },
    { label: isEn ? 'Usage hours voice log' : 'Catatan suara jam pakai', done: true },
    { label: isEn ? 'Night meter photo' : 'Foto meter malam', done: hasTwoRecords },
  ];

  const today = analytics.scenarios.appliance;
  const top = today.rows[0];
  const rec = analytics.recommendations[0];
  const maxWeek = Math.max(1, ...analytics.week.map((d) => d.kwh));
  const doneCount = missionSteps.filter((s) => s.done).length;

  function handleApplyHomeRec() {
    setAppliedHomeRec(true);
    setHomeNotice(
      isEn
        ? 'Recommendation applied! Appliance schedule optimized in 2D Kiosk.'
        : `Saran diterapkan! Jadwal pemakaian ${top?.label ?? 'alat'} telah dioptimasi di Kios 2D.`,
    );
    setTimeout(() => setHomeNotice(null), 3500);
  }

  // Fallback nominal jika scenario 'insufficient_data' (misal data hari < 3)
  const displayTotalRp =
    today.total_rp !== null ? formatRp(today.total_rp) : formatRp(analytics.kiosResult.rp_day);
  const displayPerUnitRp =
    today.per_unit_rp !== null
      ? formatRp(today.per_unit_rp)
      : formatRp(Math.round(analytics.kiosResult.rp_day / Math.max(1, profile.dailyVolume)));

  return (
    <main className="page page--wide">
      {homeNotice && (
        <div className="notice" role="status" style={{ marginBottom: '1rem' }}>
          <Icon name="check" size={18} />
          <div>{homeNotice}</div>
        </div>
      )}

      <section className="page-head">
        <Reveal>
          <div className="row-gap">
            <Eyebrow>
              {profile.businessName} · {template.display_name}
            </Eyebrow>
            <span className="chip">{profile.tariffName}</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            {t.home.titlePre}<em>{displayTotalRp}</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">
            {t.home.ledePre}<strong>{displayPerUnitRp}</strong>{t.home.ledeMid}
            {profile.unitLabel} ({profile.dailyVolume} {profile.unitLabel}/{isEn ? 'day' : 'hari'}){t.home.ledePost}
          </p>
        </Reveal>
      </section>

      {!user.onboarded && (
        <Reveal>
          <Bezel tone="moss" coreClassName="onboard-banner">
            <div className="onboard-banner__header">
              <div className="onboard-banner__mascot">
                <TerraAvatar mood="hallo" size={72} />
              </div>
              <div className="onboard-banner__text">
                <Eyebrow>{isEn ? 'Business Setup' : 'Profil Usaha'}</Eyebrow>
                <p className="twin__title">{isEn ? 'Set up your business profile' : 'Atur profil usaha Anda'}</p>
                <p className="hint">
                  {isEn
                    ? 'Choose your business type and customize your electrical appliances in the 2D Kiosk for accurate calculations.'
                    : 'Pilih jenis usaha dan sesuaikan alat listrik di Kios 2D agar perhitungan biaya listrik akurat.'}
                </p>
              </div>
            </div>
            <div className="capture__actions onboard-banner__actions">
              <IslandLink href="/masuk" icon="store">
                {isEn ? 'Start Setup' : 'Mulai Pengaturan'}
              </IslandLink>
              <IslandLink href="/kios" variant="ghost" icon="arrow">
                {isEn ? 'Open 2D Kiosk' : 'Buka Kios 2D'}
              </IslandLink>
            </div>
          </Bezel>
        </Reveal>
      )}

      <section className="bento">
        <Reveal className="bento__hero">
          <Bezel tone="ink" coreClassName="hero-card">
            <div className="row-between">
              <Eyebrow tone="light">{isEn ? 'Last 24 hours' : '24 jam terakhir'} · {template.display_name}</Eyebrow>
              <div className="row-gap">
                <MockBadge />
              </div>
            </div>

            <div className="hero-card__figure">
              <span className="hero-card__rp">{displayTotalRp}</span>
              <span className="hero-card__kwh">
                {formatKwh(today.result.meter_delta_kwh ?? analytics.kiosResult.kwh_day)} · {isEn ? 'tariff' : 'tarif'} {profile.tariffName}
              </span>
            </div>

            <div className="week" role="img" aria-label={isEn ? 'Past 7 days usage' : 'Pemakaian 7 hari terakhir'}>
              {analytics.week.map((d, i) => (
                <div key={d.day} className={`week__col ${i === analytics.week.length - 1 ? 'is-today' : ''}`}>
                  <div className="week__track">
                    <span
                      className="week__bar"
                      style={{ transform: `scaleY(${d.kwh / maxWeek})`, transitionDelay: `${i * 60}ms` }}
                    />
                  </div>
                  <span className="week__day">{d.day}</span>
                </div>
              ))}
            </div>

            <div className="row-between hero-card__foot">
              <ConfidenceBadge level={today.confidence} />
              <span className="muted-light">{profile.dataDays} {isEn ? 'days data' : 'hari data'}</span>
            </div>
          </Bezel>
        </Reveal>

        <Reveal className="bento__a" delay={80}>
          <Bezel coreClassName="stat-card">
            <Eyebrow>{isEn ? 'Highest in' : 'Paling boros di'} {template.display_name}</Eyebrow>
            <p className="stat-card__name">{top?.label ?? (isEn ? 'No appliances yet' : 'Belum ada alat')}</p>
            <p className="stat-card__value">
              {top ? formatRp(top.rp) : '—'}
              <span>/{isEn ? 'day' : 'hari'}</span>
            </p>
            <div className="meter-line" aria-hidden="true">
              <span style={{ transform: `scaleX(${top?.share ?? 0})` }} />
            </div>
            <p className="stat-card__note">
              {top ? Math.round(top.share * 100) : 0}% {isEn ? 'of yesterday usage' : 'dari pemakaian kemarin'}
            </p>
            <div className="row-gap">
              <IslandLink href="/biaya" variant="ghost">
                {isEn ? 'View details' : 'Lihat rincian'}
              </IslandLink>
            </div>
          </Bezel>
        </Reveal>

        <Reveal className="bento__b" delay={140}>
          <Bezel tone="moss" coreClassName="mission-card">
            <div className="row-between">
              <Eyebrow>{isEn ? 'Meter Mission' : 'Misi Meter'} · {isEn ? 'day' : 'hari'} {profile.dataDays}/7</Eyebrow>
              <span className="mission-card__count">
                {doneCount}/{missionSteps.length}
              </span>
            </div>
            <ul className="steps">
              {missionSteps.map((s) => (
                <li key={s.label} className={s.done ? 'is-done' : ''}>
                  <span className="steps__dot">{s.done && <Icon name="check" size={12} />}</span>
                  {s.label}
                </li>
              ))}
            </ul>
            <IslandLink href="/catat" icon={hasTwoRecords ? 'check' : 'capture'}>
              {hasTwoRecords
                ? isEn ? 'Missions completed ✓' : 'Semua misi selesai ✓'
                : isEn ? 'Night meter photo' : 'Foto meter malam'}
            </IslandLink>
          </Bezel>
        </Reveal>

        {rec && (
          <Reveal className="bento__c" delay={100}>
            <Bezel coreClassName="rec-card">
              <div className="row-between">
                <Eyebrow>Saran #1 · {template.display_name}</Eyebrow>
                <ConfidenceBadge level={rec.confidence} short />
              </div>
              <p className="rec-card__title">{rec.title}</p>
              <p className="rec-card__save">
                Hemat {formatRp(rec.est_saving_rp.min)}–{formatRp(rec.est_saving_rp.max)}
                <span> per hari</span>
              </p>
              {rec.safety_note && (
                <p className="rec-card__note">
                  <Icon name="info" size={14} /> {rec.safety_note}
                </p>
              )}
              <div className="row-gap" style={{ marginTop: '0.65rem' }}>
                <button
                  type="button"
                  className={`selected-tpl-pill ${appliedHomeRec ? 'is-active' : ''}`}
                  onClick={handleApplyHomeRec}
                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
                >
                  <Icon name={appliedHomeRec ? 'check' : 'bolt'} size={12} />
                  <span>{appliedHomeRec ? 'Diterapkan ✓' : 'Terapkan Saran'}</span>
                </button>
                <IslandLink href="/biaya" variant="ghost">
                  {isEn ? 'View in Cost' : 'Buka Biaya'}
                </IslandLink>
              </div>
            </Bezel>
          </Reveal>
        )}

        <Reveal className="bento__d" delay={160}>
          <Bezel coreClassName="gap-card">
            <Eyebrow>Belum terjelaskan</Eyebrow>
            <p className="gap-card__value">
              {today.unexplained_rp !== null ? formatRp(today.unexplained_rp) : '—'}
            </p>
            <p className="gap-card__note">
              {isEn
                ? 'Difference between meter log and recorded appliances.'
                : 'Selisih antara catatan meter dan alat yang tercatat.'}
            </p>
          </Bezel>
        </Reveal>
      </section>
    </main>
  );
}
