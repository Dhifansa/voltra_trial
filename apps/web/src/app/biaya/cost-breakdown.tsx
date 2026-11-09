'use client';

import { useState } from 'react';
import { Bezel, ConfidenceBadge, Eyebrow, IslandLink, MockBadge, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import { formatKwh, formatRp } from '@/lib/format';
import { getDictionary } from '@/lib/i18n';
import type { CostScenario, ScenarioId } from '@/lib/mock-data';

const SCENARIO_ORDER: ScenarioId[] = ['appliance', 'category', 'insufficient'];
const SEGMENT_TONES = ['seg-1', 'seg-2', 'seg-3', 'seg-4', 'seg-5'];
const EFFORT_LABEL = { low: 'Mudah', medium: 'Sedang', high: 'Butuh usaha' } as const;

export function CostBreakdown() {
  const { profile, analytics, settings } = useVoltraApp();
  const template = getTemplate(profile.templateId);
  const t = getDictionary(settings.language || 'id');
  const [id] = useState<ScenarioId>('appliance');
  const s = analytics.scenarios[id];

  return (
    <>
      <div className="row-between kios-toolbar" style={{ marginBottom: '1.25rem' }}>
        <div className="row-gap">
          <span className="chip">{profile.businessName}</span>
          <span className="chip chip--high">{template.display_name}</span>
          <span className="chip">{profile.tariffName}</span>
        </div>
        <IslandLink href="/kios" variant="ghost" icon="store">
          {t.cost.manageKiosk}
        </IslandLink>
      </div>

      <div key={`${profile.templateId}-${id}`} className="swap">
        {s.display_level === 'insufficient_data' ? (
          <Insufficient s={s} />
        ) : (
          <Breakdown
            s={s}
            unitLabel={profile.unitLabel}
            templateName={template.display_name}
            recommendations={analytics.recommendations}
          />
        )}
      </div>
    </>
  );
}

function Summary({ s, unitLabel }: { s: CostScenario; unitLabel: string }) {
  const { settings } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');
  const meter = s.result.meter_delta_kwh ?? 0;
  const unexplainedShare = meter > 0 && s.result.unexplained_kwh ? s.result.unexplained_kwh / meter : 0;

  return (
    <Bezel tone="ink" coreClassName="summary">
      <div className="row-between">
        <Eyebrow tone="light">{t.cost.totalYesterday}</Eyebrow>
      </div>
      <p className="summary__rp">{s.total_rp !== null ? formatRp(s.total_rp) : '—'}</p>
      <p className="summary__meta">
        {formatKwh(meter)} · {s.per_unit_rp !== null ? formatRp(s.per_unit_rp) : '—'}/{unitLabel.split(' ')[0]}
      </p>

      <div className="stack" role="img" aria-label={t.cost.composition}>
        {s.rows.map((r, i) => (
          <span
            key={r.id}
            className={`stack__seg ${SEGMENT_TONES[i % SEGMENT_TONES.length]}`}
            style={{ flexGrow: r.share }}
            title={`${r.label} ${Math.round(r.share * 100)}%`}
          />
        ))}
        {unexplainedShare > 0 && (
          <span className="stack__seg stack__seg--gap" style={{ flexGrow: unexplainedShare }} title={t.cost.unexplained} />
        )}
      </div>

      <div className="row-between summary__foot">
        <ConfidenceBadge level={s.confidence} />
      </div>
    </Bezel>
  );
}

function Breakdown({
  s,
  unitLabel,
  templateName,
  recommendations,
}: {
  s: CostScenario;
  unitLabel: string;
  templateName: string;
  recommendations: ReturnType<typeof useVoltraApp>['analytics']['recommendations'];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const isCategory = s.display_level === 'category';

  return (
    <>
      <Reveal>
        <Summary s={s} unitLabel={unitLabel} />
      </Reveal>

      {isCategory && (
        <Reveal delay={60}>
          <div className="notice">
            <Icon name="alert" size={18} />
            <div>
              <strong>Selisih dengan meter masih besar.</strong> Rincian per alat belum bisa dipercaya, jadi kami
              tampilkan per kelompok alat dulu.
              {s.result.next_questions?.[0] && <span className="notice__q">{s.result.next_questions[0]}</span>}
            </div>
          </div>
        </Reveal>
      )}

      <section className="section">
        <div className="section__head">
          <Eyebrow>{isCategory ? 'Per kelompok alat' : `Per alat (${templateName})`}</Eyebrow>
          <span className="section__aside">ketuk baris untuk lihat rumus</span>
        </div>

        <ol className="rows">
          {s.rows.map((r, i) => {
            const open = openId === r.id;
            return (
              <Reveal as="li" key={r.id} delay={i * 60}>
                <Bezel coreClassName="cost-row">
                  <button
                    type="button"
                    className="cost-row__main"
                    aria-expanded={r.basis ? open : undefined}
                    onClick={() => r.basis && setOpenId(open ? null : r.id)}
                    disabled={!r.basis}
                  >
                    <span className={`cost-row__swatch ${SEGMENT_TONES[i % SEGMENT_TONES.length]}`} />
                    <span className="cost-row__name">
                      {r.label}
                      <small>{formatKwh(r.kwh)}</small>
                    </span>
                    <span className="cost-row__rp">
                      {formatRp(r.rp)}
                      <small>{Math.round(r.share * 100)}%</small>
                    </span>
                  </button>
                  <div className="meter-line" aria-hidden="true">
                    <span style={{ transform: `scaleX(${r.share})` }} />
                  </div>
                  {r.basis && (
                    <div className={`cost-row__basis ${open ? 'is-open' : ''}`}>
                      <div>
                        <p>
                          <span>Dasar hitung</span> {r.basis}
                        </p>
                      </div>
                    </div>
                  )}
                </Bezel>
              </Reveal>
            );
          })}

          {s.result.unexplained_kwh !== null && s.result.unexplained_kwh > 0 && (
            <Reveal as="li" delay={s.rows.length * 60}>
              <div className="gap-row">
                <div className="cost-row__main">
                  <span className="cost-row__swatch stack__seg--gap" />
                  <span className="cost-row__name">
                    Belum terjelaskan
                    <small>{formatKwh(s.result.unexplained_kwh)}</small>
                  </span>
                  <span className="cost-row__rp">{s.unexplained_rp !== null ? formatRp(s.unexplained_rp) : '—'}</span>
                </div>
                <p className="gap-row__note">
                  Tambahkan alat yang belum tercatat agar angka selisih ini mengecil.
                </p>
                <div className="row-gap">
                  <IslandLink href="/catat" variant="ghost" icon="tag">
                    Foto label alat
                  </IslandLink>
                  <IslandLink href="/kios" variant="ghost" icon="store">
                    Atur alat di Kios
                  </IslandLink>
                </div>
              </div>
            </Reveal>
          )}
        </ol>
      </section>

      <section className="section">
        <div className="section__head">
          <Eyebrow>Rekomendasi Hemat · {templateName}</Eyebrow>
        </div>
        <ol className="recs">
          {recommendations.map((rec, i) => (
            <Reveal as="li" key={rec.action_id} delay={i * 70}>
              <Bezel coreClassName="rec-row">
                <span className="rec-row__rank">{String(i + 1).padStart(2, '0')}</span>
                <div className="rec-row__body">
                  <p className="rec-row__title">{rec.title}</p>
                  <p className="rec-row__save">
                    {formatRp(rec.est_saving_rp.min)}–{formatRp(rec.est_saving_rp.max)} <span>/hari</span>
                  </p>
                  <div className="row-gap">
                    <ConfidenceBadge level={rec.confidence} short />
                    <span className="chip">{EFFORT_LABEL[rec.effort]}</span>
                  </div>
                </div>
              </Bezel>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}

function Insufficient({ s }: { s: CostScenario }) {
  const days = 1;
  const need = 3;
  return (
    <Reveal>
      <Bezel coreClassName="empty">
        <span className="empty__icon">
          <Icon name="meter" size={28} />
        </span>
        <Eyebrow>Belum cukup data</Eyebrow>
        <h2 className="empty__title">
          Butuh <em>{need - days} hari</em> lagi
        </h2>
        <p className="empty__text">
          Kami baru punya {days} hari foto meter. Rincian Rupiah per alat baru muncul setelah minimal {need} hari agar
          tidak menebak.
        </p>
        <div className="dots" aria-label={`${days} dari ${need} hari`}>
          {Array.from({ length: need }, (_, i) => (
            <span key={i} className={i < days ? 'is-on' : ''} />
          ))}
        </div>
        <div className="row-gap">
          <ConfidenceBadge level={s.confidence} />
          <MockBadge />
        </div>
        <IslandLink href="/catat" icon="capture">
          Foto meter sekarang
        </IslandLink>
      </Bezel>
    </Reveal>
  );
}
