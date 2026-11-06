'use client';

import { useState } from 'react';
import { Bezel, ConfidenceBadge, Eyebrow, IslandLink, MockBadge, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { formatKwh, formatRp } from '@/lib/format';
import {
  COST_SCENARIOS,
  MOCK_BUSINESS,
  MOCK_RECOMMENDATIONS,
  type CostScenario,
  type ScenarioId,
} from '@/lib/mock-data';

const SCENARIO_ORDER: ScenarioId[] = ['appliance', 'category', 'insufficient'];
const SEGMENT_TONES = ['seg-1', 'seg-2', 'seg-3', 'seg-4', 'seg-5'];
const EFFORT_LABEL = { low: 'Mudah', medium: 'Sedang', high: 'Butuh usaha' } as const;

export function CostBreakdown() {
  const [id, setId] = useState<ScenarioId>('appliance');
  const s = COST_SCENARIOS[id];

  return (
    <>
      <div className="segmented" role="tablist" aria-label="Pratinjau keadaan data (contoh)">
        {SCENARIO_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={id === key}
            className={`segmented__item ${id === key ? 'is-active' : ''}`}
            onClick={() => setId(key)}
          >
            {COST_SCENARIOS[key].label}
          </button>
        ))}
      </div>
      <p className="segmented__hint">
        <Icon name="info" size={14} /> Pratinjau keadaan UI: {s.hint}
      </p>

      <div key={id} className="swap">
        {s.display_level === 'insufficient_data' ? <Insufficient s={s} /> : <Breakdown s={s} />}
      </div>
    </>
  );
}

function Summary({ s }: { s: CostScenario }) {
  const meter = s.result.meter_delta_kwh ?? 0;
  const unexplainedShare = meter > 0 && s.result.unexplained_kwh ? s.result.unexplained_kwh / meter : 0;

  return (
    <Bezel tone="ink" coreClassName="summary">
      <div className="row-between">
        <Eyebrow tone="light">Total kemarin</Eyebrow>
        <div className="row-gap">
          <MockBadge />
        </div>
      </div>
      <p className="summary__rp">{s.total_rp !== null ? formatRp(s.total_rp) : '—'}</p>
      <p className="summary__meta">
        {formatKwh(meter)} · {s.per_unit_rp !== null ? formatRp(s.per_unit_rp) : '—'}/{MOCK_BUSINESS.unit_label.split(' ')[0]}
      </p>

      <div className="stack" role="img" aria-label="Komposisi biaya">
        {s.rows.map((r, i) => (
          <span
            key={r.id}
            className={`stack__seg ${SEGMENT_TONES[i % SEGMENT_TONES.length]}`}
            style={{ flexGrow: r.share }}
            title={`${r.label} ${Math.round(r.share * 100)}%`}
          />
        ))}
        {unexplainedShare > 0 && (
          <span className="stack__seg stack__seg--gap" style={{ flexGrow: unexplainedShare }} title="Belum terjelaskan" />
        )}
      </div>

      <div className="row-between summary__foot">
        <ConfidenceBadge level={s.confidence} />
        <span className="muted-light">mesin v{s.result.engine_version}</span>
      </div>
    </Bezel>
  );
}

function Breakdown({ s }: { s: CostScenario }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const isCategory = s.display_level === 'category';

  return (
    <>
      <Reveal>
        <Summary s={s} />
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
          <Eyebrow>{isCategory ? 'Per kelompok alat' : 'Per alat'}</Eyebrow>
          <span className="section__aside">diurutkan dari terbesar</span>
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
                  Tidak kami bagi paksa ke alat lain. Tambahkan alat yang belum tercatat agar angka ini mengecil.
                </p>
                <IslandLink href="/catat" variant="ghost" icon="tag">
                  Tambah alat
                </IslandLink>
              </div>
            </Reveal>
          )}
        </ol>
      </section>

      <section className="section">
        <div className="section__head">
          <Eyebrow>Yang bisa diubah</Eyebrow>
          <span className="section__aside">maks. 3 saran</span>
        </div>
        <ol className="recs">
          {MOCK_RECOMMENDATIONS.map((rec, i) => (
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
        <p className="footnote">Saran tidak dijalankan otomatis. Anda yang memutuskan: setujui, tunda, atau tolak.</p>
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

