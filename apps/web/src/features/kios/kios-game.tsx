'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  type KiosSlot,
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
        ? `${top} paling banyak makan listrik di outlet ini. Gerakkan Terra mendekati alat atau ketuk alatnya!`
        : 'Tambah alat di lantai outlet untuk mulai simulasi.',
  },
  boros: {
    label: 'Boros',
    line: () => 'Waduh, tagihan simulasi naik! Gerakkan Terra ke alat pemanas untuk mengurangi jam pakainya.',
  },
};

/* ====================================================================== */
/*  Posisi Tata Letak Alat Sesuai Kios / Outlet Asli (2.5D Room Layout)   */
/* ====================================================================== */

interface StationCoord {
  x: number; // persentase horizontal (12..88)
  y: number; // persentase vertikal (18..82)
  zone: string;
}

const TEMPLATE_STATION_MAP: Record<string, Record<string, StationCoord>> = {
  laundry: {
    lamp: { x: 50, y: 20, zone: 'Plafon Kios' },
    pump: { x: 18, y: 43, zone: 'pipa & Tandon Air' },
    washer: { x: 46, y: 43, zone: 'Area Cuci Basah' },
    dryer: { x: 77, y: 43, zone: 'Area Pengering' },
    iron: { x: 28, y: 74, zone: 'Meja Setrika Uap' },
  },
  warung: {
    lamp: { x: 50, y: 20, zone: 'Plafon Warung' },
    freezer: { x: 18, y: 43, zone: 'Sudut Beku' },
    fridge: { x: 45, y: 43, zone: 'Dapur Bahan' },
    ricecooker: { x: 76, y: 43, zone: 'Meja Saji Nasi' },
    fan: { x: 24, y: 74, zone: 'Area Meja Makan' },
    blender: { x: 64, y: 74, zone: 'Bar Minuman' },
  },
  roti: {
    lamp: { x: 50, y: 20, zone: 'Plafon Bakery' },
    oven: { x: 20, y: 43, zone: 'Dapur Panggang' },
    mixer: { x: 49, y: 43, zone: 'Meja Adonan' },
    chiller: { x: 78, y: 43, zone: 'Pendingin Bahan' },
    display: { x: 30, y: 74, zone: 'Etalase Depan' },
  },
  kustom: {
    lamp: { x: 50, y: 20, zone: 'Plafon Utama' },
    fan: { x: 24, y: 74, zone: 'Area Depan' },
  },
};

const FALLBACK_STATIONS: StationCoord[] = [
  { x: 50, y: 20, zone: 'Plafon Kios' },
  { x: 18, y: 43, zone: 'Area Kerja Kiri' },
  { x: 46, y: 43, zone: 'Meja Tengah' },
  { x: 76, y: 43, zone: 'Area Kerja Kanan' },
  { x: 24, y: 74, zone: 'Lantai Depan Kiri' },
  { x: 54, y: 74, zone: 'Etalase Tengah' },
  { x: 32, y: 58, zone: 'Koridor Kiri' },
  { x: 66, y: 58, zone: 'Koridor Kanan' },
];

function computeSlotPositions(templateId: string, slots: KiosSlot[]): Record<string, StationCoord> {
  const preset = TEMPLATE_STATION_MAP[templateId] ?? {};
  const used: StationCoord[] = [];
  const result: Record<string, StationCoord> = {};

  const isTooClose = (a: StationCoord, b: StationCoord) =>
    Math.hypot(a.x - b.x, a.y - b.y) < 15;

  for (const slot of slots) {
    const preferred = preset[slot.appliance.id] ?? TEMPLATE_STATION_MAP.laundry?.[slot.appliance.id] ?? TEMPLATE_STATION_MAP.warung?.[slot.appliance.id] ?? TEMPLATE_STATION_MAP.roti?.[slot.appliance.id];
    if (preferred && !used.some((u) => isTooClose(u, preferred))) {
      result[slot.uid] = preferred;
      used.push(preferred);
      continue;
    }

    const freeFallback = FALLBACK_STATIONS.find((cand) => !used.some((u) => isTooClose(u, cand)));
    if (freeFallback) {
      result[slot.uid] = freeFallback;
      used.push(freeFallback);
    } else {
      const idx = used.length;
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const dynamicCoord: StationCoord = {
        x: 20 + col * 28,
        y: Math.min(80, 38 + row * 22),
        zone: `Area #${idx + 1}`,
      };
      result[slot.uid] = dynamicCoord;
      used.push(dynamicCoord);
    }
  }

  return result;
}

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
            Saat memilih <strong>{template.display_name}</strong>, tata letak ruangan outlet Kios 2D serta daftar alat
            di <strong>Beranda</strong>, <strong>Keuangan/Biaya</strong>, dan <strong>Catat</strong> otomatis ikut
            berubah.
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
/*  Main Kios 2D — Game Denah Outlet Interaktif + Karakter Terra Bergerak  */
/* ====================================================================== */

type TutorialStage = 'pick-appliance' | 'set-hours' | 'summary';

function clampCoord(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

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
  const stationPositions = useMemo(
    () => computeSlotPositions(state.templateId, state.slots),
    [state.templateId, state.slots],
  );

  const [selectedUid, setSelectedUid] = useState<string | null>(state.slots[0]?.uid ?? null);
  const [showCatalog, setShowCatalog] = useState(false);

  // Posisi karakter Terra di dalam ruangan outlet (persentase x, y)
  const [terraPos, setTerraPos] = useState<{ x: number; y: number }>({ x: 52, y: 66 });
  const [terraFacing, setTerraFacing] = useState<'left' | 'right'>('right');
  const [terraWalking, setTerraWalking] = useState(false);
  const walkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floorArenaRef = useRef<HTMLDivElement>(null);

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
      setTerraPos({ x: 52, y: 66 });
    }
  }, [state.templateId]);

  useEffect(() => {
    return () => {
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    };
  }, []);

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

  // Cari alat terdekat dari posisi Terra saat ini
  const nearestSlot = useMemo(() => {
    let best: { slot: KiosSlot; dist: number } | null = null;
    for (const s of state.slots) {
      const pos = stationPositions[s.uid];
      if (!pos) continue;
      const d = Math.hypot(pos.x - terraPos.x, pos.y - terraPos.y);
      if (!best || d < best.dist) {
        best = { slot: s, dist: d };
      }
    }
    return best && best.dist <= 22 ? best.slot : null;
  }, [state.slots, stationPositions, terraPos]);

  const nextUnconfiguredSlot =
    state.slots.find((s) => !configuredUids.includes(s.uid)) ?? top ?? state.slots[0];

  const triggerWalkAnimation = useCallback((durationMs = 360) => {
    setTerraWalking(true);
    if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    walkTimerRef.current = setTimeout(() => {
      setTerraWalking(false);
    }, durationMs);
  }, []);

  // Fungsi memilih alat & menggerakkan Terra ke dekat alat tersebut
  const handlePickAppliance = useCallback(
    (uid: string, openControlStage = true) => {
      const targetPos = stationPositions[uid];
      if (targetPos) {
        setTerraPos((prev) => {
          const nextX = clampCoord(targetPos.x + (targetPos.x > 50 ? -6 : 6), 14, 86);
          const nextY = clampCoord(targetPos.y + (targetPos.y < 30 ? 14 : 9), 26, 84);
          if (nextX < prev.x - 1) setTerraFacing('left');
          else if (nextX > prev.x + 1) setTerraFacing('right');
          return { x: nextX, y: nextY };
        });
        triggerWalkAnimation(420);
      }

      if (tutorialRunning && stage === 'set-hours' && selectedUid && selectedUid !== uid) {
        setConfiguredUids((prev) => Array.from(new Set([...prev, selectedUid])));
      }
      setSelectedUid(uid);

      if (tutorialRunning && openControlStage) {
        setStage('set-hours');
        setPopupOpen(true);
        setTimeout(() => {
          controlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 260);
      }
    },
    [stationPositions, triggerWalkAnimation, tutorialRunning, stage, selectedUid],
  );

  // Gerakkan Terra dengan langkah D-Pad atau Keyboard (WASD / Arrow)
  const moveTerraByDelta = useCallback(
    (dx: number, dy: number) => {
      if (dx < 0) setTerraFacing('left');
      if (dx > 0) setTerraFacing('right');
      triggerWalkAnimation(260);

      setTerraPos((prev) => {
        const next = {
          x: clampCoord(prev.x + dx, 12, 88),
          y: clampCoord(prev.y + dy, 22, 84),
        };

        // Cek apakah posisi baru berada di dekat salah satu alat
        let closestUid: string | null = null;
        let closestDist = 18;
        for (const s of state.slots) {
          const p = stationPositions[s.uid];
          if (!p) continue;
          const dist = Math.hypot(p.x - next.x, p.y - next.y);
          if (dist < closestDist) {
            closestDist = dist;
            closestUid = s.uid;
          }
        }
        if (closestUid) {
          setSelectedUid(closestUid);
        }
        return next;
      });
    },
    [state.slots, stationPositions, triggerWalkAnimation],
  );

  // Keyboard listener (Arrow keys / WASD) untuk menggerakkan Terra
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const step = 7;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveTerraByDelta(-step, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveTerraByDelta(step, 0);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moveTerraByDelta(0, -step);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveTerraByDelta(0, step);
      } else if (e.key === 'Enter' && nearestSlot) {
        e.preventDefault();
        handlePickAppliance(nearestSlot.uid, true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moveTerraByDelta, nearestSlot, handlePickAppliance]);

  // Klik di lantai outlet -> Terra berjalan ke titik tersebut
  function handleArenaClick(e: React.MouseEvent<HTMLDivElement>) {
    // Abaikan jika yang diklik adalah tombol alat atau kontrol HUD
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = floorArenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = clampCoord(((e.clientX - rect.left) / rect.width) * 100, 12, 88);
    const clickY = clampCoord(((e.clientY - rect.top) / rect.height) * 100, 24, 84);

    if (clickX < terraPos.x - 1) setTerraFacing('left');
    else if (clickX > terraPos.x + 1) setTerraFacing('right');

    setTerraPos({ x: clickX, y: clickY });
    triggerWalkAnimation(400);

    // Jika titik klik dekat dengan salah satu alat, pilih alat tersebut
    let closestUid: string | null = null;
    let closestDist = 17;
    for (const s of state.slots) {
      const p = stationPositions[s.uid];
      if (!p) continue;
      const dist = Math.hypot(p.x - clickX, p.y - clickY);
      if (dist < closestDist) {
        closestDist = dist;
        closestUid = s.uid;
      }
    }
    if (closestUid) {
      setSelectedUid(closestUid);
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
  const lampSlot = state.slots.find((s) => s.appliance.icon === 'lamp');
  const roomLit = lampSlot ? lampSlot.on : true;

  return (
    <div className={`swap ${spotlightActive ? 'has-game-tutorial' : ''}`}>
      {/* Toolbar atas (ikut ngeblur saat pop-up tutorial aktif) */}
      <div className={`row-between kios-toolbar ${spotlightActive ? 'tutorial-dim' : ''}`}>
        <div className="row-gap">
          <span className="chip chip--mock">Simulasi 2D</span>
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
      {/* BAGIAN SCREEN 1: Game Rumah / Outlet Kios 2D Interaktif              */}
      {/* - Posisi alat sesuai tata letak outlet asli (Plafon, Area Kerja, dll)*/}
      {/* - Karakter Terra bisa digerakkan (Tap lantai, D-Pad, atau WASD)      */}
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
        <Bezel coreClassName={`scene scene--${mood} ${roomLit ? 'is-lit' : 'is-dimmed'}`}>
          {/* Kanopi & Papan Nama Outlet */}
          <div className="scene__awning" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="scene__sign">
            <span>{state.shopName}</span>
          </div>

          {/* Balon Status / Dialog Singkat di Atas Ruangan */}
          <div className="outlet-top-banner">
            <div className="outlet-top-banner__info">
              <strong className="wati__name">Denah Outlet · {template.display_name}</strong>
              <p>
                {nearestSlot
                  ? `Terra berada di dekat ${nearestSlot.appliance.name} (${nearestSlot.on ? `${nearestSlot.hours} jam/hari` : 'Mati'}).`
                  : MOOD_COPY[mood].line(top?.appliance.name)}
              </p>
            </div>
            <span className="outlet-top-banner__hint">Ketuk lantai / gunakan tombol arah</span>
          </div>

          {/* Arena Interior Outlet 2.5D (Dinding + Lantai + Alat + Karakter Terra) */}
          <div
            ref={floorArenaRef}
            className="outlet-arena"
            onClick={handleArenaClick}
            role="region"
            aria-label={`Ruangan Outlet ${state.shopName}. Ketuk lantai atau gunakan tombol arah untuk menggerakkan Terra.`}
          >
            {/* Dinding Belakang Outlet: Meteran PLN, Jendela, & Garis Plafon */}
            <div className="outlet-wall" aria-hidden="true">
              <div className="outlet-meter-box">
                <span className="outlet-meter-box__led" />
                <span className="outlet-meter-box__label">kWh PLN</span>
              </div>
              <div className="scene__window">
                <span className={`scene__sky scene__sky--${mood}`} />
              </div>
            </div>

            {/* Karpet / Zona Area Kerja Sesuai Jenis Outlet */}
            <div className="outlet-zones" aria-hidden="true">
              <div className="outlet-zone outlet-zone--back">
                <span>
                  {state.templateId === 'laundry'
                    ? 'ZONA CUCI & PENGERING'
                    : state.templateId === 'warung'
                      ? 'ZONA DAPUR & PENDINGIN'
                      : state.templateId === 'roti'
                        ? 'ZONA PANGGANG & ADONAN'
                        : 'AREA UTAMA OUTLET'}
                </span>
              </div>
              <div className="outlet-zone outlet-zone--front-left">
                <span>
                  {state.templateId === 'laundry'
                    ? 'MEJA SETRIKA & LIPAT'
                    : state.templateId === 'warung'
                      ? 'AREA PELANGGAN & MINUMAN'
                      : state.templateId === 'roti'
                        ? 'ETALASE ROTI DEPAN'
                        : 'AREA DEPAN'}
                </span>
              </div>
              <div className="outlet-counter">
                <span>MEJA KASIR</span>
              </div>
              <div className="outlet-door">
                <span>PINTU MASUK</span>
              </div>
            </div>

            {/* Alat-Alat yang Ditempatkan Sesuai Posisi Kios Asli */}
            {state.slots.map((s) => {
              const r = result.per_slot[s.uid];
              const active = s.uid === selectedUid;
              const isTop = top?.uid === s.uid;
              const isDone = configuredUids.includes(s.uid);
              const isNear = nearestSlot?.uid === s.uid;
              const pos = stationPositions[s.uid] ?? { x: 50, y: 50, zone: 'Lantai' };
              const isCeiling = s.appliance.icon === 'lamp';

              return (
                <button
                  key={s.uid}
                  type="button"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className={`outlet-station ${isCeiling ? 'outlet-station--ceiling' : ''} ${
                    s.on ? 'is-on' : 'is-off'
                  } ${active ? 'is-active' : ''} ${isTop ? 'is-top' : ''} ${
                    isNear ? 'is-near-terra' : ''
                  } ${
                    tutorialRunning && stage === 'pick-appliance' && !isDone ? 'is-guide-pulse' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePickAppliance(s.uid, true);
                  }}
                  aria-pressed={active}
                  aria-label={`${s.appliance.name} di ${pos.zone}, ${
                    s.on ? `${s.hours} jam/hari` : 'mati'
                  }`}
                >
                  {isDone && (
                    <span className="unit__done-badge" title="Sudah diatur jam pakainya">
                      <Icon name="check" size={11} />
                    </span>
                  )}
                  {s.on && r && <span className="unit__tag">{formatRp(r.rp_hour)}/jam</span>}
                  <span className="outlet-station__art">
                    <ApplianceArt icon={s.appliance.icon} on={s.on} />
                  </span>
                  <span className="outlet-station__name">{s.appliance.name}</span>
                  <span className="outlet-station__zone">{pos.zone}</span>
                </button>
              );
            })}

            {/* Karakter Terra yang Bisa Digerakkan di Dalam Outlet */}
            <div
              className={`outlet-terra ${terraWalking ? 'is-walking' : ''} ${
                terraFacing === 'left' ? 'is-left' : 'is-right'
              }`}
              style={{ left: `${terraPos.x}%`, top: `${terraPos.y}%` }}
            >
              <span className="outlet-terra__badge">
                {nearestSlot ? `🔍 ${nearestSlot.appliance.name}` : 'Terra'}
              </span>
              <button
                type="button"
                className="outlet-terra__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (nearestSlot) {
                    handlePickAppliance(nearestSlot.uid, true);
                  } else {
                    setTutorialRunning(true);
                    setPopupOpen(true);
                    setStage('pick-appliance');
                  }
                }}
                title="Karakter Terra — Gerakkan ke alat untuk memeriksa listriknya"
              >
                <span className="outlet-terra__flip">
                  <TerraAvatar mood={roomTerraMood} size={58} />
                </span>
              </button>
              <span className="outlet-terra__shadow" aria-hidden="true" />
            </div>
          </div>

          {/* Kontrol Gerak Karakter Terra (D-Pad + Tombol Interaksi Alat) */}
          <div className="outlet-controls">
            <div className="outlet-dpad" role="group" aria-label="Kendali gerak karakter Terra">
              <button
                type="button"
                className="outlet-dpad__btn"
                aria-label="Gerakkan Terra ke kiri"
                onClick={() => moveTerraByDelta(-9, 0)}
              >
                ◀
              </button>
              <div className="outlet-dpad__vert">
                <button
                  type="button"
                  className="outlet-dpad__btn"
                  aria-label="Gerakkan Terra ke atas"
                  onClick={() => moveTerraByDelta(0, -9)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="outlet-dpad__btn"
                  aria-label="Gerakkan Terra ke bawah"
                  onClick={() => moveTerraByDelta(0, 9)}
                >
                  ▼
                </button>
              </div>
              <button
                type="button"
                className="outlet-dpad__btn"
                aria-label="Gerakkan Terra ke kanan"
                onClick={() => moveTerraByDelta(9, 0)}
              >
                ▶
              </button>
            </div>

            <div className="outlet-controls__actions">
              {selected && (
                <button
                  type="button"
                  className="outlet-inspect-btn"
                  onClick={() => {
                    handlePickAppliance(selected.uid, true);
                    controlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <Icon name="pencil" size={14} />
                  <span>
                    Atur {selected.appliance.name} ({selected.on ? `${selected.hours}j` : 'Mati'})
                  </span>
                </button>
              )}
              {isKustom && (
                <button
                  type="button"
                  className="outlet-add-btn"
                  onClick={() => setShowCatalog((v) => !v)}
                >
                  <span>+ Tambah Alat</span>
                </button>
              )}
            </div>
          </div>
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
            <Eyebrow>Pilih alat untuk ditambahkan ke outlet</Eyebrow>
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
            zoneName={stationPositions[selected.uid]?.zone}
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
            Semua alat di outlet ini sudah terhubung ke halaman Keuangan/Biaya, Beranda, dan Catat Data.
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
              ? 'Gerakkan Terra atau pilih salah satu alat di outlet!'
              : `Pilih alat berikutnya (${remainingCount} alat lagi)`
          }
          message={
            nextUnconfiguredSlot
              ? `Gerakkan karakter Terra mendekati "${nextUnconfiguredSlot.appliance.name}" atau ketuk langsung alatnya di denah outlet untuk mengatur jam pakainya.`
              : 'Ketuk salah satu alat pada denah outlet di atas untuk mengatur jam pakainya.'
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
          secondaryLabel="Kembali ke Outlet"
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
  zoneName,
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
  zoneName?: string;
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
            {zoneName && <span className="chip chip--mock">{zoneName}</span>}
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
