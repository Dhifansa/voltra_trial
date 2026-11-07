'use client';

import { Bezel, ConfidenceBadge, Eyebrow, IslandLink, MockBadge, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { TerraAvatar } from '@/components/ui/terra-mascot';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import { formatKwh, formatRp } from '@/lib/format';

const MISSION_STEPS = [
  { label: 'Foto meter pagi', done: true },
  { label: 'Catatan suara jam pakai', done: true },
  { label: 'Foto meter malam', done: false },
];

export default function HomePage() {
  const { user, profile, analytics } = useVoltraApp();
  const template = getTemplate(profile.templateId);
  const today = analytics.scenarios.appliance;
  const top = today.rows[0];
  const rec = analytics.recommendations[0];
  const maxWeek = Math.max(1, ...analytics.week.map((d) => d.kwh));
  const doneCount = MISSION_STEPS.filter((s) => s.done).length;

  return (
    <main className="page page--wide">
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
            Kemarin listrik kios Anda <em>{today.total_rp !== null ? formatRp(today.total_rp) : '—'}</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">
            Sekitar <strong>{today.per_unit_rp !== null ? formatRp(today.per_unit_rp) : '—'}</strong> per{' '}
            {profile.unitLabel} ({profile.dailyVolume} {profile.unitLabel}/hari). Estimasi dari foto meter dan catatan
            suara — bukan pemantauan real-time.
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
                <Eyebrow>Alur Pengenalan bersama Terra</Eyebrow>
                <p className="twin__title">Belum mengatur profil usaha Anda?</p>
                <p className="hint">
                  Mulai dari Login → Profiling Jenis Usaha → Simulasi Kios 2D bersama maskot Terra agar semua alat di
                  aplikasi menyesuaikan usaha Anda.
                </p>
              </div>
            </div>
            <div className="capture__actions onboard-banner__actions">
              <IslandLink href="/masuk" icon="store">
                Mulai Login & Profiling
              </IslandLink>
              <IslandLink href="/kios" variant="ghost" icon="arrow">
                Buka Kios 2D
              </IslandLink>
            </div>
          </Bezel>
        </Reveal>
      )}

      <section className="bento">
        <Reveal className="bento__hero">
          <Bezel tone="ink" coreClassName="hero-card">
            <div className="row-between">
              <Eyebrow tone="light">24 jam terakhir · {template.display_name}</Eyebrow>
              <div className="row-gap">
                <MockBadge />
              </div>
            </div>

            <div className="hero-card__figure">
              <span className="hero-card__rp">{today.total_rp !== null ? formatRp(today.total_rp) : '—'}</span>
              <span className="hero-card__kwh">
                {formatKwh(today.result.meter_delta_kwh ?? 0)} · tarif {profile.tariffName}
              </span>
            </div>

            <div className="week" role="img" aria-label="Pemakaian 7 hari terakhir">
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
              <span className="muted-light">{profile.dataDays} hari data</span>
            </div>
          </Bezel>
        </Reveal>

        <Reveal className="bento__a" delay={80}>
          <Bezel coreClassName="stat-card">
            <Eyebrow>Paling boros di {template.display_name}</Eyebrow>
            <p className="stat-card__name">{top?.label ?? 'Belum ada alat'}</p>
            <p className="stat-card__value">
              {top ? formatRp(top.rp) : '—'}
              <span>/hari</span>
            </p>
            <div className="meter-line" aria-hidden="true">
              <span style={{ transform: `scaleX(${top?.share ?? 0})` }} />
            </div>
            <p className="stat-card__note">
              {top ? Math.round(top.share * 100) : 0}% dari pemakaian kemarin
            </p>
            <div className="row-gap">
              <IslandLink href="/biaya" variant="ghost">
                Lihat rincian
              </IslandLink>
              <IslandLink href="/kios" variant="ghost" icon="store">
                Atur di Kios 2D
              </IslandLink>
            </div>
          </Bezel>
        </Reveal>

        <Reveal className="bento__b" delay={140}>
          <Bezel tone="moss" coreClassName="mission-card">
            <div className="row-between">
              <Eyebrow>Misi Meter · hari {profile.dataDays}/7</Eyebrow>
              <span className="mission-card__count">
                {doneCount}/{MISSION_STEPS.length}
              </span>
            </div>
            <ul className="steps">
              {MISSION_STEPS.map((s) => (
                <li key={s.label} className={s.done ? 'is-done' : ''}>
                  <span className="steps__dot">{s.done && <Icon name="check" size={12} />}</span>
                  {s.label}
                </li>
              ))}
            </ul>
            <IslandLink href="/catat" icon="capture">
              Foto meter malam
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
              Selisih antara meter dan alat {template.display_name.toLowerCase()} yang tercatat. Kami tidak membaginya
              paksa ke alat lain.
            </p>
          </Bezel>
        </Reveal>
      </section>

      <p className="footnote">
        Angka dihitung oleh mesin <code>energy-calc</code>. Wati hanya menjelaskan, tidak membuat angka.
      </p>
    </main>
  );
}
