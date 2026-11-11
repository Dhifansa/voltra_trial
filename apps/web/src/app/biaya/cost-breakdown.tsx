'use client';

import { useState } from 'react';
import { Bezel, ConfidenceBadge, Eyebrow, IslandButton, IslandLink, MockBadge, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import { formatKwh, formatRp } from '@/lib/format';
import { getDictionary } from '@/lib/i18n';
import type { CostRow, CostScenario, ScenarioId } from '@/lib/mock-data';

const SCENARIO_ORDER: ScenarioId[] = ['appliance', 'category', 'insufficient'];
const SEGMENT_TONES = ['seg-1', 'seg-2', 'seg-3', 'seg-4', 'seg-5'];
const EFFORT_LABEL = { low: 'Mudah', medium: 'Sedang', high: 'Butuh usaha' } as const;

function downloadCsvReport(businessName: string, tariffName: string, rows: CostRow[], totalRp: number | null) {
  const dateStr = new Date().toISOString().split('T')[0];
  const header = ['Nama Usaha', 'Tanggal Laporan', 'Tarif PLN', 'Nama Alat / Kelompok', 'Konsumsi (kWh)', 'Biaya (Rp)', 'Porsi (%)'];
  const csvRows = [header.join(',')];

  rows.forEach((r) => {
    csvRows.push([
      `"${businessName}"`,
      dateStr,
      `"${tariffName}"`,
      `"${r.label}"`,
      r.kwh.toFixed(2),
      r.rp,
      `${Math.round(r.share * 100)}%`,
    ].join(','));
  });

  if (totalRp !== null) {
    csvRows.push([`"${businessName}"`, dateStr, `"${tariffName}"`, '"TOTAL KESELURUHAN"', '', totalRp, '100%'].join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Listrik_${businessName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function CostBreakdown() {
  const { profile, analytics, settings, gameCycle } = useVoltraApp();
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
        <div className="row-gap">
          <span className="chip" style={{ borderColor: '#2DD4BF', color: '#2DD4BF' }}>
            📅 Hari {gameCycle.currentDay}/7 Game
          </span>
        </div>
      </div>

      {(gameCycle.weeklyReportUnlocked || gameCycle.currentDay >= 7) && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.35), rgba(6, 78, 59, 0.45))',
            border: '1px solid #2DD4BF',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            marginBottom: '0.85rem',
          }}
        >
          <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <div className="row-gap" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>🏆</span>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#2DD4BF' }}>
                  Laporan Mingguan Hemat Listrik (Siklus 7 Hari Selesai!)
                </strong>
                <p className="hint" style={{ fontSize: '0.8rem', margin: 0 }}>
                  Efisiensi {gameCycle.weeklyReport?.efficiencyPct || 92}% · Potensi Hemat {formatRp(gameCycle.weeklyReport?.savedRp || 32500)} / minggu
                </p>
              </div>
            </div>
            <IslandLink href="/kios" icon="crown">
              Buka Rapor di Kios 2D
            </IslandLink>
          </div>
        </div>
      )}

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
            : 'Simulasi tampilan data awal sebelum syarat 2 kali pembaruan data terpenuhi.'}
      </p>

      <div key={`${profile.templateId}-${id}`} className="swap">
        {s.display_level === 'insufficient_data' ? (
          <Insufficient
            s={s}
            kiosEstimateRp={analytics.kiosResult.rp_day}
            unitLabel={profile.unitLabel}
            recordCount={profile.recordCount ?? 1}
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
  const { profile } = useVoltraApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [appliedRecs, setAppliedRecs] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const isCategory = s.display_level === 'category';

  function handleApplyRec(recId: string, title: string) {
    setAppliedRecs((prev) => ({ ...prev, [recId]: true }));
    setNotice(`Saran berhasil diterapkan ke Kios 2D: "${title}"`);
    setTimeout(() => setNotice(null), 3500);
  }

  function handleExportCsv() {
    downloadCsvReport(profile.businessName, profile.tariffName, s.rows, s.total_rp);
    setNotice(`Laporan biaya ${profile.businessName} berhasil diunduh dalam format .CSV`);
    setTimeout(() => setNotice(null), 3500);
  }

  return (
    <>
      {notice && (
        <div className="notice" role="status">
          <Icon name="check" size={18} />
          <div>{notice}</div>
        </div>
      )}

      <Reveal>
        <Summary s={s} unitLabel={unitLabel} />
      </Reveal>

      {/* Aksi Cepat: Ekspor Akuntansi & Laporan */}
      <div className="row-between" style={{ margin: '0.25rem 0 1rem' }}>
        <span className="hint">Data dihitung otomatis oleh mesin kalkulasi energi Voltess</span>
        <button
          type="button"
          className="selected-tpl-pill"
          onClick={handleExportCsv}
          title="Unduh laporan ringkasan biaya per alat dalam format CSV"
        >
          <Icon name="tag" size={13} />
          <span>Ekspor Laporan (.CSV)</span>
        </button>
      </div>

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
          <span className="section__aside">maks. 3 saran AI</span>
        </div>
        <ol className="recs">
          {recommendations.map((rec, i) => {
            const isApplied = appliedRecs[rec.action_id];
            return (
              <Reveal as="li" key={rec.action_id} delay={i * 70}>
                <Bezel coreClassName="rec-row">
                  <span className="rec-row__rank">{String(i + 1).padStart(2, '0')}</span>
                  <div className="rec-row__body">
                    <p className="rec-row__title">{rec.title}</p>
                    <p className="rec-row__save">
                      {formatRp(rec.est_saving_rp.min)}–{formatRp(rec.est_saving_rp.max)} <span>/hari</span>
                    </p>
                    <div className="row-between" style={{ marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div className="row-gap">
                        <ConfidenceBadge level={rec.confidence} short />
                        <span className="chip">{EFFORT_LABEL[rec.effort]}</span>
                      </div>
                      <button
                        type="button"
                        className={`selected-tpl-pill ${isApplied ? 'is-active' : ''}`}
                        onClick={() => handleApplyRec(rec.action_id, rec.title)}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
                      >
                        <Icon name={isApplied ? 'check' : 'bolt'} size={12} />
                        <span>{isApplied ? 'Diterapkan ✓' : 'Terapkan Saran'}</span>
                      </button>
                    </div>
                  </div>
                </Bezel>
              </Reveal>
            );
          })}
        </ol>
        <p className="footnote">Saran tidak dijalankan otomatis. Anda yang memutuskan: setujui, tunda, atau tolak.</p>
      </section>
    </>
  );
}

function Insufficient({
  s: _s,
  kiosEstimateRp,
  unitLabel,
  recordCount = 1,
}: {
  s: CostScenario;
  kiosEstimateRp: number;
  unitLabel: string;
  recordCount?: number;
}) {
  const count = Math.min(2, Math.max(1, recordCount));
  const need = 2;
  const remaining = Math.max(0, need - count);
  const estimateTotal = kiosEstimateRp > 0 ? kiosEstimateRp : 38500;
  const perUnit = Math.round(estimateTotal / Math.max(1, 30));

  return (
    <Reveal>
      <div className="stack-gap">
        {/* Kartu Ringkasan Total Biaya Sementara (Estimasi Awal) */}
        <Bezel tone="ink" coreClassName="summary">
          <div className="row-between">
            <Eyebrow tone="light">Total Kemarin (Estimasi Sementara)</Eyebrow>
            <span className="chip chip--mock">Data Awal ({count}/{need} Catatan)</span>
          </div>
          <p className="summary__rp">{formatRp(estimateTotal)}</p>
          <p className="summary__meta">
            Estimasi awal · {formatRp(perUnit)}/{unitLabel.split(' ')[0]}
          </p>

          <div className="meter-line" aria-hidden="true" style={{ margin: '0.85rem 0 0.5rem' }}>
            <span style={{ transform: `scaleX(${count / need})` }} />
          </div>
          <div className="row-between summary__foot">
            <span className="muted-light">Progres pencatatan: {count} dari {need} kali tercatat</span>
            <ConfidenceBadge level="low" />
          </div>
        </Bezel>

        {/* Kartu Edukasi: Aturan Data Histori Minimal 2 Kali Catat */}
        <Bezel coreClassName="empty">
          <span className="empty__icon">
            <Icon name="meter" size={28} />
          </span>
          <Eyebrow>Aturan Data Histori</Eyebrow>
          <h2 className="empty__title">
            {remaining > 0 ? (
              <>
                Butuh pembaruan data <em>{remaining} kali</em> lagi
              </>
            ) : (
              <>Syarat 2 kali catatan terpenuhi!</>
            )}
          </h2>
          <p className="empty__text">
            Total biaya di atas adalah estimasi awal. Sesuai aturan kalkulasi energi, <strong>rincian Rupiah per masing-masing alat akan langsung keluar setelah minimal 2 kali pembaruan data</strong> (foto meter, label alat, atau suara) agar perhitungan akurat dan terverifikasi.
          </p>
          <div className="dots" aria-label={`${count} dari ${need} kali catatan`}>
            {Array.from({ length: need }, (_, i) => (
              <span key={i} className={i < count ? 'is-on' : ''} />
            ))}
          </div>
          <div className="capture__actions" style={{ marginTop: '0.65rem' }}>
            <IslandLink href="/catat" icon="capture">
              {remaining > 0
                ? `Update Data Sekarang (Catatan ke-${count + 1})`
                : 'Tambah Catatan Baru'}
            </IslandLink>
          </div>
        </Bezel>
      </div>
    </Reveal>
  );
}
