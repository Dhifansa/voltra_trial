import { Bezel, ConfidenceBadge, Eyebrow, IslandLink, MockBadge, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { formatKwh, formatRp } from '@/lib/format';
import { COST_SCENARIOS, MOCK_BUSINESS, MOCK_RECOMMENDATIONS, MOCK_WEEK } from '@/lib/mock-data';

const today = COST_SCENARIOS.appliance;
const top = today.rows[0];
const rec = MOCK_RECOMMENDATIONS[0]!;
const maxWeek = Math.max(...MOCK_WEEK.map((d) => d.kwh));

const MISSION_STEPS = [
  { label: 'Foto meter pagi', done: true },
  { label: 'Catatan suara jam pakai', done: true },
  { label: 'Foto meter malam', done: false },
];

export default function HomePage() {
  const doneCount = MISSION_STEPS.filter((s) => s.done).length;

  return (
    <main className="page page--wide">
      <section className="page-head">
        <Reveal>
          <Eyebrow>Rabu, 6 November · {MOCK_BUSINESS.name}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            Kemarin listrik kios Anda <em>{today.total_rp !== null ? formatRp(today.total_rp) : '—'}</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">
            Sekitar <strong>{today.per_unit_rp !== null ? formatRp(today.per_unit_rp) : '—'}</strong> per{' '}
            {MOCK_BUSINESS.unit_label}. Estimasi dari foto meter dan catatan suara — bukan pemantauan real-time.
          </p>
        </Reveal>
      </section>

      <section className="bento">
        <Reveal className="bento__hero">
          <Bezel tone="ink" coreClassName="hero-card">
            <div className="row-between">
              <Eyebrow tone="light">24 jam terakhir</Eyebrow>
              <div className="row-gap">
                <MockBadge />
              </div>
            </div>

            <div className="hero-card__figure">
              <span className="hero-card__rp">{today.total_rp !== null ? formatRp(today.total_rp) : '—'}</span>
              <span className="hero-card__kwh">
                {formatKwh(today.result.meter_delta_kwh ?? 0)} · tarif {MOCK_BUSINESS.tariff_name}
              </span>
            </div>

            <div className="week" role="img" aria-label="Pemakaian 7 hari terakhir">
              {MOCK_WEEK.map((d, i) => (
                <div key={d.day} className={`week__col ${i === MOCK_WEEK.length - 1 ? 'is-today' : ''}`}>
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
              <span className="muted-light">{MOCK_BUSINESS.data_days} hari data</span>
            </div>
          </Bezel>
        </Reveal>

        <Reveal className="bento__a" delay={80}>
          <Bezel coreClassName="stat-card">
            <Eyebrow>Paling boros</Eyebrow>
            <p className="stat-card__name">{top?.label}</p>
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
            <IslandLink href="/biaya" variant="ghost">
              Lihat rincian
            </IslandLink>
          </Bezel>
        </Reveal>

        <Reveal className="bento__b" delay={140}>
          <Bezel tone="moss" coreClassName="mission-card">
            <div className="row-between">
              <Eyebrow>Misi Meter · hari 5/7</Eyebrow>
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

        <Reveal className="bento__c" delay={100}>
          <Bezel coreClassName="rec-card">
            <div className="row-between">
              <Eyebrow>Saran #1</Eyebrow>
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

        <Reveal className="bento__d" delay={160}>
          <Bezel coreClassName="gap-card">
            <Eyebrow>Belum terjelaskan</Eyebrow>
            <p className="gap-card__value">
              {today.unexplained_rp !== null ? formatRp(today.unexplained_rp) : '—'}
            </p>
            <p className="gap-card__note">
              Selisih antara meter dan alat yang tercatat. Kami tidak membaginya paksa ke alat lain.
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
