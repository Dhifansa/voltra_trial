'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KiosTemplate } from '@voltra/contracts';
import { Bezel, Eyebrow, IslandButton, IslandLink, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { TerraAvatar, TerraGameTutorial, type TerraMood } from '@/components/ui/terra-mascot';
import { useVoltraApp } from '@/context/app-context';
import { formatKwh, formatRp } from '@/lib/format';
import { ApplianceArt } from './appliance-art';
import {
  CHALLENGE_TARGET,
  addSlot,
  challengeProgress,
  compute,
  hourBounds,
  moodOf,
  removeSlot,
  setHours,
  toggleSlot,
  topSlot,
  type KiosMood,
  type KiosState,
} from './model';
import { APPLIANCE_CATALOG, OPEN_HOURS, TEMPLATES, TEMPLATE_META, getTemplate } from './templates';

const CATEGORY_LABEL = {
  heater: 'Pemanas',
  cooling: 'Pendingin',
  lighting: 'Penerangan',
  other: 'Motor & lainnya',
} as const;

const MOOD_COPY: Record<KiosMood, { label: string; line: (top?: string) => string }> = {
  hemat: {
    label: 'Hemat',
    line: () =>
      'Hore! Tagihan simulasi turun lebih dari 10%. Semua angka alat ini sudah tersinkron ke Beranda & Biaya!',
  },
  normal: {
    label: 'Normal',
    line: (top) =>
      top
        ? `${top} paling banyak makan listrik di kios ini. Ketuk alatnya lalu atur jam pakai per harinya!`
        : 'Tambah alat di lantai kios untuk mulai simulasi.',
  },
  boros: {
    label: 'Boros',
    line: () => 'Waduh, tagihan simulasi naik! Coba kurangi jam pakai alat pemanas atau matikan alat yang tidak wajib.',
  },
};

export function KiosGame() {
  const {
    hydrated,
    user,
    kios,
    kiosBaselineRp,
    profile,
    selectTemplate,
    updateKios,
    completeKiosTutorial,
  } = useVoltraApp();
  const [pickingTemplate, setPickingTemplate] = useState(false);

  if (!hydrated) return <div className="kios-skeleton" aria-busy="true" />;

  if (pickingTemplate) {
    return (
      <TemplatePicker
        initialTemplateId={profile.templateId}
        initialShopName={profile.businessName}
        onPick={(template, name) => {
          selectTemplate(template.template_id, name);
          setPickingTemplate(false);
        }}
        onCancel={() => setPickingTemplate(false)}
      />
    );
  }

  return (
    <KiosPlay
      state={kios}
      baseline={kiosBaselineRp}
      tariffName={profile.tariffName}
      tariffRate={profile.tariffRpPerKwh}
      initialTutorial={!user.kiosTutorialDone}
      onCompleteTutorial={completeKiosTutorial}
      onChange={updateKios}
      onSwitchTemplate={() => setPickingTemplate(true)}
    />
  );
}

/* ====================================================================== */
/*  Pilih template (Tutorial Game: Bagian yang aktif pop-out, lain blur)   */
/* ====================================================================== */

function TemplatePicker({
  initialTemplateId,
  initialShopName,
  onPick,
  onCancel,
}: {
  initialTemplateId: string;
  initialShopName: string;
  onPick: (t: KiosTemplate, name: string) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<string>(initialTemplateId || 'laundry');
  const [name, setName] = useState(initialShopName);
  const [tplStep, setTplStep] = useState<1 | 2>(1);
  const [tutorialRunning] = useState(true);
  const [popupOpen, setPopupOpen] = useState(true);
  const spotlightActive = tutorialRunning && popupOpen;

  const gridRef = useRef<HTMLOListElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const template = getTemplate(selected);

  return (
    <div className={`swap ${spotlightActive ? 'has-game-tutorial' : ''}`}>
      <ol
        ref={gridRef}
        className={`tpl-grid ${
          spotlightActive ? (tplStep === 1 ? 'tutorial-pop' : 'tutorial-dim') : ''
        }`}
        role="radiogroup"
        aria-label="Jenis usaha"
      >
        {TEMPLATES.map((t, i) => {
          const active = t.template_id === selected;
          return (
            <Reveal as="li" key={t.template_id} delay={i * 60}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                className={`tpl ${active ? 'is-active' : ''}`}
                onClick={() => {
                  setSelected(t.template_id);
                  setTplStep(2);
                  if (tutorialRunning) {
                    setPopupOpen(true);
                  }
                  setTimeout(() => {
                    confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 80);
                }}
              >
                <span className="tpl__art">
                  {t.appliances.slice(0, 3).map((a) => (
                    <span key={a.id}>
                      <ApplianceArt icon={a.icon} on />
                    </span>
                  ))}
                  {t.template_id === 'kustom' && (
                    <span className="tpl__plus">
                      <Icon name="arrow" size={18} />
                    </span>
                  )}
                </span>
                <span className="tpl__body">
                  <span className="tpl__name">{t.display_name}</span>
                  <span className="tpl__blurb">{TEMPLATE_META[t.template_id]?.blurb}</span>
                </span>
                <span className="tpl__check" aria-hidden="true">
                  {active && <Icon name="check" size={14} />}
                </span>
              </button>
            </Reveal>
          );
        })}
      </ol>

      <div
        ref={confirmRef}
        className={spotlightActive ? (tplStep === 2 ? 'tutorial-pop' : 'tutorial-dim') : ''}
      >
        <Bezel coreClassName="result">
          <label className="field">
            <span>Nama kios</span>
            <div className="field__control">
              <input
                value={name}
                maxLength={28}
                placeholder={`Mis. ${template.display_name} Bu Sari`}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </label>
          <p className="hint">
            Saat memilih <strong>{template.display_name}</strong>, daftar alat di <strong>Beranda</strong>,{' '}
            <strong>Keuangan/Biaya</strong>, dan <strong>Catat</strong> otomatis ikut berubah.
          </p>
          <div className="capture__actions">
            <IslandButton icon="store" onClick={() => onPick(template, name.trim() || template.display_name)}>
              Terapkan Template Ini
            </IslandButton>
            <IslandButton variant="ghost" icon="close" onClick={onCancel}>
              Batal
            </IslandButton>
          </div>
        </Bezel>
      </div>

      <TerraGameTutorial
        active={spotlightActive}
        mood={tplStep === 1 ? 'hallo' : 'hore'}
        tone={tplStep === 1 ? 'blue' : 'green'}
        stepBadge={`Tutorial ${tplStep}/2`}
        title={
          tplStep === 1
            ? 'Pilih salah satu kartu Template Jenis Usaha di atas!'
            : `Konfirmasi nama untuk ${template.display_name}`
        }
        message={
          tplStep === 1
            ? 'Bagian daftar template sedang aktif di layar. Ketuk salah satu kartu jenis usaha untuk memilihnya!'
            : 'Sekarang bagian nama kios sedang aktif. Isi nama kios lalu tekan tombol "Terapkan Template Ini"!'
        }
        secondaryLabel={tplStep === 2 ? 'Pilih Ulang Template' : undefined}
        onSecondaryAction={
          tplStep === 2
            ? () => {
                setTplStep(1);
                setPopupOpen(true);
                gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            : undefined
        }
        primaryLabel={tplStep === 1 ? 'Lanjut ke Nama Kios' : 'Terapkan Template'}
        onPrimaryAction={() => {
          if (tplStep === 1) {
            setTplStep(2);
            setPopupOpen(true);
            confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            onPick(template, name.trim() || template.display_name);
          }
        }}
        onClose={() => setPopupOpen(false)}
      />
    </div>
  );
}

/* ====================================================================== */
/*  Main Kios 2D — Game Tutorial Spotlight:                                */
/*  - Bagian dari screen yang sedang dipandu POP UP tajam (`.tutorial-pop`)*/
/*  - Bagian screen yang lain NGEBLUR jadi background (`.tutorial-dim`)    */
/*  - Tahap 1: Lantai Kios 2D pop-up -> suruh pilih per alat               */
/*  - Tahap 2: Ketika sudah memilih -> Panel Jam Pakai Per Hari pop-up     */
/* ====================================================================== */

type TutorialStage = 'pick-appliance' | 'set-hours' | 'summary';

function KiosPlay({
  state,
  baseline,
  tariffName,
  tariffRate,
  initialTutorial,
  onCompleteTutorial,
  onChange,
  onSwitchTemplate,
}: {
  state: KiosState;
  baseline: number;
  tariffName: string;
  tariffRate: number;
  initialTutorial: boolean;
  onCompleteTutorial: () => void;
  onChange: (s: KiosState, rebase?: boolean) => void;
  onSwitchTemplate: () => void;
}) {
  const template = getTemplate(state.templateId);
  const result = useMemo(() => compute(state, tariffRate), [state, tariffRate]);
  const [selectedUid, setSelectedUid] = useState<string | null>(state.slots[0]?.uid ?? null);
  const [showCatalog, setShowCatalog] = useState(false);

  // tutorialRunning menjaga sesi panduan tetap aktif walau pop-up ditutup sementara (close)
  const [tutorialRunning, setTutorialRunning] = useState<boolean>(initialTutorial);
  const [popupOpen, setPopupOpen] = useState<boolean>(initialTutorial);
  const spotlightActive = tutorialRunning && popupOpen;

  const [stage, setStage] = useState<TutorialStage>('pick-appliance');
  const [configuredUids, setConfiguredUids] = useState<string[]>([]);

  const prevTemplateRef = useRef(state.templateId);
  const sceneRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.slots.some((s) => s.uid === selectedUid)) {
      setSelectedUid(state.slots[0]?.uid ?? null);
    }
  }, [state.slots, selectedUid]);

  useEffect(() => {
    if (prevTemplateRef.current !== state.templateId) {
      prevTemplateRef.current = state.templateId;
      setConfiguredUids([]);
      setStage('pick-appliance');
      setTutorialRunning(true);
      setPopupOpen(true);
    }
  }, [state.templateId]);

  const selected = state.slots.find((s) => s.uid === selectedUid) ?? null;
  const top = topSlot(state, result);
  const mood = moodOf(result.rp_day, baseline);
  const progress = challengeProgress(result.rp_day, baseline);
  const changePct = baseline > 0 ? Math.round(((baseline - result.rp_day) / baseline) * 100) : 0;
  const isKustom = state.templateId === 'kustom';

  const activeCount = state.slots.filter((s) => s.on).length;
  const roomTerraMood: TerraMood = useMemo(() => {
    if (activeCount === 0 || (selected && !selected.on)) return 'tidur';
    if (mood === 'hemat') return 'hore';
    if (mood === 'boros') return 'cemas';
    if (stage === 'pick-appliance') return 'hallo';
    if (stage === 'set-hours') return 'mikir';
    return 'biasa';
  }, [activeCount, selected, mood, stage]);

  const nextUnconfiguredSlot =
    state.slots.find((s) => !configuredUids.includes(s.uid)) ?? top ?? state.slots[0];

  // Ketika pengguna memilih salah satu alat di lantai Kios 2D:
  // Meskipun pop-up sebelumnya di-close, karena tutorialRunning masih berjalan,
  // otomatis lanjut ke tahap set-hours dan pop-up Terra muncul kembali!
  function handlePickAppliance(uid: string) {
    if (tutorialRunning && stage === 'set-hours' && selectedUid && selectedUid !== uid) {
      setConfiguredUids((prev) => Array.from(new Set([...prev, selectedUid])));
    }
    setSelectedUid(uid);
    if (tutorialRunning) {
      setStage('set-hours');
      setPopupOpen(true);
      setTimeout(() => {
        controlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  }

  // Ketika selesai mengatur jam pakai per hari untuk alat ini -> lanjut pilih alat berikutnya atau ke ringkasan
  function handleFinishCurrentApplianceHours() {
    const nextConfigured = selectedUid
      ? Array.from(new Set([...configuredUids, selectedUid]))
      : configuredUids;
    setConfiguredUids(nextConfigured);

    const remaining = state.slots.filter((s) => !nextConfigured.includes(s.uid));
    if (remaining.length > 0) {
      setStage('pick-appliance');
      setPopupOpen(true);
      setTimeout(() => {
        sceneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    } else {
      setStage('summary');
      setPopupOpen(true);
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  }

  function handleJumpToSummary() {
    if (selectedUid && !configuredUids.includes(selectedUid)) {
      setConfiguredUids((prev) => [...prev, selectedUid]);
    }
    setStage('summary');
    setPopupOpen(true);
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  function handleCompleteTutorial() {
    setPopupOpen(false);
    setTutorialRunning(false);
    onCompleteTutorial();
  }

  const selectedStats = selected ? result.per_slot[selected.uid] : undefined;
  const remainingCount = state.slots.filter((s) => !configuredUids.includes(s.uid)).length;

  return (
    <div className={`swap ${spotlightActive ? 'has-game-tutorial' : ''}`}>
      {/* Toolbar atas (ikut ngeblur saat pop-up tutorial aktif) */}
      <div className={`row-between kios-toolbar ${spotlightActive ? 'tutorial-dim' : ''}`}>
        <div className="row-gap">
          <span className="chip chip--mock">Simulasi</span>
          <span className="chip">{template.display_name}</span>
          <span className="chip">{tariffName}</span>
        </div>
        <div className="row-gap">
          <button
            type="button"
            className="terra-pill-trigger"
            onClick={() => {
              setTutorialRunning(true);
              setPopupOpen(true);
              setStage('pick-appliance');
              setTimeout(() => {
                sceneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 60);
            }}
          >
            <TerraAvatar mood={roomTerraMood} size={20} />
            <span>Tutorial Terra ({configuredUids.length}/{state.slots.length} Alat)</span>
          </button>
          <button type="button" className="textlink" onClick={onSwitchTemplate}>
            Ganti usaha
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BAGIAN SCREEN 1: Ruangan & Lantai Alat Kios 2D                       */}
      {/* Pop-out tajam saat `stage === 'pick-appliance'`, ngeblur saat tahap 2 */}
      {/* ==================================================================== */}
      <div
        ref={sceneRef}
        className={
          spotlightActive
            ? stage === 'pick-appliance'
              ? 'tutorial-pop'
              : 'tutorial-dim'
            : ''
        }
      >
        <Bezel coreClassName={`scene scene--${mood}`}>
          <div className="scene__awning" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="scene__sign">
            <span>{state.shopName}</span>
          </div>

          <div className="scene__wall">
            <div className="scene__window" aria-hidden="true">
              <span className={`scene__sky scene__sky--${mood}`} />
            </div>

            <div className="wati" aria-live="polite">
              <button
                type="button"
                className="wati__btn"
                onClick={() => {
                  setTutorialRunning(true);
                  setPopupOpen(true);
                  setStage('pick-appliance');
                }}
                title="Ketuk Terra untuk mulai tutorial pilih per alat"
              >
                <TerraAvatar
                  mood={roomTerraMood}
                  size={56}
                  className={`wati__img wati__img--${mood}`}
                />
              </button>
              <div className="wati__bubble">
                <strong className="wati__name">Terra · Asisten Kios</strong>
                <p>{MOOD_COPY[mood].line(top?.appliance.name)}</p>
              </div>
            </div>
          </div>

          <ul className="floor" aria-label="Alat di kios">
            {state.slots.map((s) => {
              const r = result.per_slot[s.uid];
              const active = s.uid === selectedUid;
              const isTop = top?.uid === s.uid;
              const isDone = configuredUids.includes(s.uid);
              return (
                <li key={s.uid}>
                  <button
                    type="button"
                    className={`unit ${s.on ? 'is-on' : 'is-off'} ${active ? 'is-active' : ''} ${isTop ? 'is-top' : ''} ${tutorialRunning && stage === 'pick-appliance' && !isDone ? 'is-guide-pulse' : ''}`}
                    onClick={() => handlePickAppliance(s.uid)}
                    aria-pressed={active}
                    aria-label={`${s.appliance.name}, ${s.on ? `${s.hours} jam` : 'mati'}`}
                  >
                    {isDone && (
                      <span className="unit__done-badge" title="Sudah diatur jam pakainya">
                        <Icon name="check" size={11} />
                      </span>
                    )}
                    {s.on && r && <span className="unit__tag">{formatRp(r.rp_hour)}/jam</span>}
                    <span className="unit__art">
                      <ApplianceArt icon={s.appliance.icon} on={s.on} />
                    </span>
                    <span className="unit__name">{s.appliance.name}</span>
                  </button>
                </li>
              );
            })}
            {isKustom && (
              <li>
                <button type="button" className="unit unit--add" onClick={() => setShowCatalog((v) => !v)}>
                  <span className="unit__plus">+</span>
                  <span className="unit__name">Tambah alat</span>
                </button>
              </li>
            )}
          </ul>
        </Bezel>
      </div>

      {isKustom && showCatalog && (
        <div
          className={
            spotlightActive
              ? stage === 'pick-appliance'
                ? 'tutorial-pop'
                : 'tutorial-dim'
              : ''
          }
        >
          <Bezel coreClassName="catalog">
            <Eyebrow>Pilih alat untuk ditambahkan</Eyebrow>
            <div className="catalog__list">
              {APPLIANCE_CATALOG.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="catalog__item"
                  onClick={() => {
                    const next = addSlot(state, a);
                    onChange(next, true);
                    const newest = next.slots[next.slots.length - 1]!;
                    setSelectedUid(newest.uid);
                    setShowCatalog(false);
                    if (tutorialRunning) {
                      setStage('set-hours');
                      setPopupOpen(true);
                      setTimeout(() => {
                        controlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 80);
                    }
                  }}
                >
                  <span className="catalog__art">
                    <ApplianceArt icon={a.icon} on />
                  </span>
                  {a.name}
                </button>
              ))}
            </div>
          </Bezel>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BAGIAN SCREEN 2: Penggunaan Jam Pakai Per Hari (ApplianceControl)    */}
      {/* Pop-out tajam saat `stage === 'set-hours'`, ngeblur saat tahap lain   */}
      {/* ==================================================================== */}
      {selected && (
        <div
          ref={controlRef}
          className={
            spotlightActive
              ? stage === 'set-hours'
                ? 'tutorial-pop'
                : 'tutorial-dim'
              : ''
          }
        >
          <ApplianceControl
            key={selected.uid}
            slot={selected}
            rpDay={result.per_slot[selected.uid]?.rp_day ?? 0}
            rpHour={result.per_slot[selected.uid]?.rp_hour ?? 0}
            kwh={result.per_slot[selected.uid]?.kwh ?? 0}
            removable={isKustom || state.slots.length > 1}
            showTutorialNext={tutorialRunning && stage === 'set-hours'}
            onNextAppliance={handleFinishCurrentApplianceHours}
            onInteractionCommit={
              tutorialRunning && stage === 'set-hours'
                ? handleFinishCurrentApplianceHours
                : undefined
            }
            onHours={(h) => onChange(setHours(state, selected.uid, h))}
            onToggle={() => onChange(toggleSlot(state, selected.uid))}
            onRemove={() => {
              onChange(removeSlot(state, selected.uid), true);
              setSelectedUid(null);
              if (tutorialRunning) {
                setStage('pick-appliance');
                setPopupOpen(true);
              }
            }}
          />
        </div>
      )}

      {/* ==================================================================== */}
      {/* BAGIAN SCREEN 3: Tagihan Simulasi & Lanjutkan ke Aplikasi Utama      */}
      {/* Pop-out tajam saat `stage === 'summary'`, ngeblur saat tahap 1 & 2    */}
      {/* ==================================================================== */}
      <div
        ref={summaryRef}
        className={`stack-gap ${
          spotlightActive
            ? stage === 'summary'
              ? 'tutorial-pop'
              : 'tutorial-dim'
            : ''
        }`}
      >
        <Bezel tone="ink" coreClassName="bill">
          <div className="row-between">
            <Eyebrow tone="light">Tagihan simulasi / hari</Eyebrow>
            <span className={`mood mood--${mood}`}>{MOOD_COPY[mood].label}</span>
          </div>
          <p className="bill__rp">{formatRp(result.rp_day)}</p>
          <p className="bill__meta">
            {formatKwh(result.kwh_day)} · awal {formatRp(baseline)} ·{' '}
            <strong className={changePct > 0 ? 'is-down' : changePct < 0 ? 'is-up' : ''}>
              {changePct > 0 ? `turun ${changePct}%` : changePct < 0 ? `naik ${Math.abs(changePct)}%` : 'belum berubah'}
            </strong>
          </p>

          <div className="challenge">
            <div className="row-between">
              <span className="challenge__title">
                <Icon name="leaf" size={16} /> Tantangan: turunkan {Math.round(CHALLENGE_TARGET * 100)}%
              </span>
              <span className="challenge__pct">{Math.round(progress * 100)}%</span>
            </div>
            <div className="meter-line" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className="hint">Jam buka tetap {OPEN_HOURS} jam. Alat wajib tidak bisa dimatikan.</p>
          </div>
        </Bezel>

        <Bezel tone="moss" coreClassName="twin">
          <Eyebrow>Tersinkron Otomatis</Eyebrow>
          <p className="twin__title">Lanjutkan ke Aplikasi Utama ({template.display_name})</p>
          <p className="hint">
            Semua alat di kios ini sudah terhubung ke halaman Keuangan/Biaya, Beranda, dan Catat Data.
          </p>
          <div className="capture__actions">
            <IslandLink href="/biaya" icon="chart" onClick={handleCompleteTutorial}>
              Lihat Rincian Biaya
            </IslandLink>
            <IslandLink href="/catat" variant="ghost" icon="capture" onClick={handleCompleteTutorial}>
              Catat Data Asli
            </IslandLink>
            <IslandLink href="/" variant="ghost" icon="home" onClick={handleCompleteTutorial}>
              Ke Beranda
            </IslandLink>
          </div>
        </Bezel>
      </div>

      <p className={`footnote ${spotlightActive ? 'tutorial-dim' : ''}`}>
        Simulasi memakai tarif {tariffName} dan mesin <code>energy-calc</code>. Bukan tagihan asli —{' '}
        <Link href="/catat" className="textlink">
          catat data nyata
        </Link>
        .
      </p>

      {/* ==================================================================== */}
      {/* TUTORIAL GAME TERRA (DIRENDER KE BODY DI ATAS NAVBAR)                */}
      {/* Ketika klik Close (×), popupOpen=false tetapi tutorialRunning tetap   */}
      {/* berjalan dan akan pop-up lagi saat user menyelesaikan tugasnya!      */}
      {/* ==================================================================== */}
      {stage === 'pick-appliance' && (
        <TerraGameTutorial
          active={spotlightActive}
          mood={configuredUids.length === 0 ? 'hallo' : 'biasa'}
          tone="blue"
          stepBadge={`Langkah 1/3 · Pilih Alat (${configuredUids.length}/${state.slots.length})`}
          title={
            configuredUids.length === 0
              ? 'Pilih salah satu alat di lantai kios!'
              : `Pilih alat berikutnya (${remainingCount} alat lagi)`
          }
          message={
            nextUnconfiguredSlot
              ? `Ketuk gambar "${nextUnconfiguredSlot.appliance.name}" pada kios di atas untuk mengatur jam pakai per harinya.`
              : 'Ketuk salah satu alat pada kios di atas untuk mengatur jam pakainya.'
          }
          primaryLabel={configuredUids.length > 0 ? 'Selesai & Lihat Tagihan' : undefined}
          onPrimaryAction={configuredUids.length > 0 ? handleJumpToSummary : undefined}
          onClose={() => setPopupOpen(false)}
        />
      )}

      {stage === 'set-hours' && selected && (
        <TerraGameTutorial
          active={spotlightActive}
          mood={mood === 'hemat' ? 'hore' : 'mikir'}
          tone={mood === 'hemat' ? 'green' : 'blue'}
          stepBadge="Tutorial 2/3 · Jam Pakai Per Hari"
          title={`Atur penggunaan jam pakai per hari: ${selected.appliance.name}`}
          message={
            selected.appliance.usage_pattern.always_on
              ? `${selected.appliance.name} bekerja 24 jam penuh (${formatRp(selectedStats?.rp_day ?? 0)}/hari). Klik tombol di bawah untuk memilih alat berikutnya!`
              : `Geser slider "Jam pakai per hari" (${selected.on ? `${selected.hours} jam/hari` : 'Mati'} = ${formatRp(selectedStats?.rp_day ?? 0)}/hari), lalu simpan!`
          }
          secondaryLabel="Kembali Pilih Alat"
          onSecondaryAction={() => {
            setStage('pick-appliance');
            setPopupOpen(true);
            setTimeout(() => {
              sceneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 60);
          }}
          primaryLabel={
            remainingCount > 1 || (remainingCount === 1 && !configuredUids.includes(selected.uid))
              ? 'Simpan & Pilih Alat Berikutnya'
              : 'Simpan & Lihat Total Tagihan'
          }
          onPrimaryAction={handleFinishCurrentApplianceHours}
          onClose={() => setPopupOpen(false)}
        />
      )}

      {stage === 'summary' && (
        <TerraGameTutorial
          active={spotlightActive}
          mood="hore"
          tone="green"
          stepBadge="Tutorial 3/3 · Selesai!"
          title={`Hore! Jam pakai semua alat ${template.display_name} selesai diatur!`}
          message={`Total simulasi: ${formatRp(result.rp_day)}/hari (${formatKwh(result.kwh_day)}). Semua pengaturan alat ini sudah otomatis tersinkron ke Rincian Biaya, Beranda, dan Catat Data!`}
          secondaryLabel="Atur Ulang Alat"
          onSecondaryAction={() => {
            setStage('pick-appliance');
            setPopupOpen(true);
            setTimeout(() => {
              sceneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 60);
          }}
          primaryLabel="Selesai Tutorial (Buka Semua)"
          onPrimaryAction={handleCompleteTutorial}
          onClose={handleCompleteTutorial}
        />
      )}
    </div>
  );
}

function ApplianceControl({
  slot,
  rpDay,
  rpHour,
  kwh,
  removable,
  showTutorialNext,
  onNextAppliance,
  onInteractionCommit,
  onHours,
  onToggle,
  onRemove,
}: {
  slot: KiosState['slots'][number];
  rpDay: number;
  rpHour: number;
  kwh: number;
  removable: boolean;
  showTutorialNext?: boolean;
  onNextAppliance?: () => void;
  onInteractionCommit?: () => void;
  onHours: (h: number) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const a = slot.appliance;
  const bounds = hourBounds(a);
  const alwaysOn = a.usage_pattern.always_on;
  const pct = bounds.max > bounds.min ? ((slot.hours - bounds.min) / (bounds.max - bounds.min)) * 100 : 100;
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
  }, []);

  function scheduleCommit() {
    if (!onInteractionCommit || !dirtyRef.current) return;
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      dirtyRef.current = false;
      onInteractionCommit();
    }, 550);
  }

  return (
    <Bezel coreClassName="control">
      <div className="control__head">
        <span className="control__art">
          <ApplianceArt icon={a.icon} on={slot.on} />
        </span>
        <div className="control__title">
          <p>{a.name}</p>
          <div className="row-gap">
            <span className="chip">{CATEGORY_LABEL[a.category]}</span>
            <span className="chip">{a.power_w.typical} W</span>
            {a.critical && <span className="chip chip--high">Wajib</span>}
          </div>
        </div>
        {!a.critical && (
          <button
            type="button"
            role="switch"
            aria-checked={slot.on}
            aria-label={slot.on ? 'Matikan alat' : 'Nyalakan alat'}
            className={`switch ${slot.on ? 'is-on' : ''}`}
            onClick={() => {
              dirtyRef.current = true;
              onToggle();
              scheduleCommit();
            }}
          >
            <span />
          </button>
        )}
      </div>

      <div className="control__stats">
        <div>
          <span>Per hari</span>
          <strong>{formatRp(rpDay)}</strong>
        </div>
        <div>
          <span>Per jam</span>
          <strong>{formatRp(rpHour)}</strong>
        </div>
        <div>
          <span>Energi</span>
          <strong>{formatKwh(kwh)}</strong>
        </div>
      </div>

      {alwaysOn ? (
        <p className="hint">
          <Icon name="info" size={14} /> Menyala 24 jam. Hemat dengan merawat seal pintu dan mengurangi buka-tutup.
        </p>
      ) : (
        <label className="slider">
          <span className="row-between">
            <span>Jam pakai per hari</span>
            <strong>{slot.on ? `${slot.hours} jam` : 'Mati'}</strong>
          </span>
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={0.5}
            value={slot.hours}
            disabled={!slot.on}
            onPointerDown={() => {
              if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
            }}
            onChange={(e) => {
              dirtyRef.current = true;
              if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
              onHours(Number(e.target.value));
            }}
            onMouseUp={scheduleCommit}
            onTouchEnd={scheduleCommit}
            onKeyUp={scheduleCommit}
            style={{ ['--pct' as string]: `${pct}%` }}
          />
          <span className="row-between slider__scale">
            <span>{bounds.min} jam</span>
            <span>{bounds.max} jam</span>
          </span>
        </label>
      )}

      {showTutorialNext && onNextAppliance && (
        <div className="capture__actions">
          <IslandButton
            icon="check"
            onClick={() => {
              if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
              dirtyRef.current = false;
              onNextAppliance();
            }}
          >
            Simpan Jam Pakai & Pilih Alat Berikutnya
          </IslandButton>
        </div>
      )}

      {removable && !a.critical && (
        <button type="button" className="textlink" onClick={onRemove}>
          Hapus alat ini dari kios
        </button>
      )}
    </Bezel>
  );
}
