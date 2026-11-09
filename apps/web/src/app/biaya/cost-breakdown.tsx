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
  const [id, setId] = useState<ScenarioId>('appliance');
  const s = analytics.scenarios[id];

  return (
    <>
      <div className="row-between kios-toolbar">
        <div className="row-gap">
          <span className="chip">{profile.businessName}</span>
          <span className="chip chip--high">{template.display_name}</span>
          <span className="chip">{profile.tariffName}</span>
        </div>
      </div>

      <div className="segmented" role="tablist" aria-label="Tampilan rincian biaya">
        {SCENARIO_ORDER.map((key) => {
          const scenarioLabel =
            key === 'appliance'
              ? t.cost.tabAppliance
              : key === 'category'
                ? t.cost.tabCategory
                : t.cost.tabInitial;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={id === key}
              className={`segmented__item ${id === key ? 'is-active' : ''}`}
              onClick={() => setId(key)}
            >
              {scenarioLabel}
            </button>
          );
        })}
      </div>
      <p className="segmented__hint">
        <Icon name="info" size={14} />{' '}
        {id === 'appliance'
          ? 'Rincian pemakaian listrik presisi dihitung per masing-masing alat.'
          : id === 'category'
            ? 'Pengelompokan pemakaian listrik berdasarkan kategori fungsi peralatan.'
            : 'Simulasi tampilan data awal sebelum syarat histori 3 hari foto meter terpenuhi.'}
      </p>

      <div key={`${profile.templateId}-${id}`} className="swap">
        {s.display_level === 'insufficient_data' ? (
          <Insufficient
            s={s}
            kiosEstimateRp={analytics.kiosResult.rp_day}
            unitLabel={profile.unitLabel}
          />
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
        <div className="row-gap">
          <MockBadge />
        </div>
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
        <span className="muted-light">mesin v{s.result.engine_version}</span>
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
                </div>
              </div>
            </Reveal>
          )}
        </ol>
      </section>

      <section className="section">
        <div className="section__head">
          <Eyebrow>Yang bisa diubah di {templateName}</Eyebrow>
          <span className="section__aside">maks. 3 saran</span>
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
        <p className="footnote">Saran tidak dijalankan otomatis. Anda yang memutuskan: setujui, tunda, atau tolak.</p>
      </section>
    </>
  );
}

function Insufficient({
  s,
  kiosEstimateRp,
  unitLabel,
}: {
  s: CostScenario;
  kiosEstimateRp: number;
  unitLabel: string;
}) {
  const days = 1;
  const need = 3;
  const remainingDays = need - days;
  const estimateTotal = kiosEstimateRp > 0 ? kiosEstimateRp : 38500;
  const perUnit = Math.round(estimateTotal / Math.max(1, 30));

  return (
    <Reveal>
      <div className="stack-gap">
        {/* Kartu Ringkasan Total Biaya Sementara (Estimasi Awal) */}
        <Bezel tone="ink" coreClassName="summary">
          <div className="row-between">
            <Eyebrow tone="light">Total Kemarin (Estimasi Sementara)</Eyebrow>
            <span className="chip chip--mock">Data Awal ({days}/{need} Hari)</span>
          </div>
          <p className="summary__rp">{formatRp(estimateTotal)}</p>
          <p className="summary__meta">
            Estimasi awal · {formatRp(perUnit)}/{unitLabel.split(' ')[0]}
          </p>

          <div className="meter-line" aria-hidden="true" style={{ margin: '0.85rem 0 0.5rem' }}>
            <span style={{ transform: `scaleX(${days / need})` }} />
          </div>
          <div className="row-between summary__foot">
            <span className="muted-light">Progres data meter: {days} dari {need} hari tercatat</span>
            <ConfidenceBadge level="low" />
          </div>
        </Bezel>

        {/* Kartu Edukasi: Aturan Data Histori Wajib Minimal 3 Hari */}
        <Bezel coreClassName="empty">
          <span className="empty__icon">
            <Icon name="meter" size={28} />
          </span>
          <Eyebrow>Aturan Data Histori</Eyebrow>
          <h2 className="empty__title">
            Butuh foto meter <em>{remainingDays} hari</em> lagi
          </h2>
          <p className="empty__text">
            Total biaya di atas adalah estimasi awal. Sesuai aturan kalkulasi energi, <strong>rincian Rupiah per masing-masing alat baru dapat dibuka setelah minimal {need} hari data foto meter terkumpul</strong> agar angka tidak menebak dan benar-benar terverifikasi.
          </p>
          <div className="dots" aria-label={`${days} dari ${need} hari`}>
            {Array.from({ length: need }, (_, i) => (
              <span key={i} className={i < days ? 'is-on' : ''} />
            ))}
          </div>
          <div className="capture__actions" style={{ marginTop: '0.65rem' }}>
            <IslandLink href="/catat" icon="capture">
              Foto Meter Sekarang (Hari ke-{days + 1})
            </IslandLink>
          </div>
        </Bezel>
      </div>
    </Reveal>
  );
}
