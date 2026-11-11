'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KiosTemplate } from '@voltra/contracts';
import { Bezel, Eyebrow, IslandButton, IslandLink, Reveal } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';
import { TerraAvatar, TerraGameTutorial, type TerraMood } from '@/components/ui/terra-mascot';
import { useVoltraApp, type WeeklySavingReport } from '@/context/app-context';
import { formatKwh, formatRp } from '@/lib/format';
import { getDictionary } from '@/lib/i18n';
import { ApplianceArt } from './appliance-art';
import {
  TEMPLATE_PROPS,
  OutletPropArt,
  ShopCatArt,
  type InteractivePropDef,
} from './outlet-props-art';

function downloadWeeklyReportCsv(
  shopName: string,
  templateName: string,
  tariffName: string,
  report: WeeklySavingReport,
  slots: KiosSlot[],
) {
  const dateStr = new Date().toISOString().split('T')[0];
  const header = [
    'Nama Usaha',
    'Siklus Minggu Ke',
    'Tanggal Laporan',
    'Tarif PLN',
    'Grade Efisiensi',
    'Persentase Efisiensi',
    'Total Pemakaian (kWh)',
    'Total Biaya (Rp)',
    'Total Penghematan (Rp)',
    'Alat Terhemat',
    'Alat Paling Boros',
  ];
  const summaryRow = [
    `"${shopName}"`,
    `Minggu ke-${report.weekNumber}`,
    dateStr,
    `"${tariffName}"`,
    `"${report.grade}"`,
    `${report.efficiencyPct}%`,
    report.totalKwh,
    report.totalRp,
    report.savedRp,
    `"${report.bestAppliance}"`,
    `"${report.wastefulAppliance}"`,
  ];

  const applianceHeader = [
    'Nama Alat Listrik',
    'Kategori',
    'Daya (Watt)',
    'Jam Pakai/Hari',
    'Status Operasional',
    'Konsumsi 7 Hari (kWh)',
    'Estimasi 7 Hari (Rp)',
  ];
  const applianceRows = slots.map((s) => {
    const kwh7 = Number(
      (
        (s.appliance.power_w.typical / 1000) *
        (s.on ? s.hours : 0) *
        s.appliance.load_factor.typical *
        7
      ).toFixed(1),
    );
    const rp7 = Math.round(kwh7 * 1444.7);
    return [
      `"${s.appliance.name}"`,
      `"${s.appliance.category}"`,
      s.appliance.power_w.typical,
      s.on ? s.hours : 0,
      s.on ? 'Menyala' : 'Mati',
      kwh7,
      rp7,
    ].join(',');
  });

  const fullCsv = [
    header.join(','),
    summaryRow.join(','),
    '',
    'RINCIAN ALAT LISTRIK KIOS SELAMA 7 HARI:',
    applianceHeader.join(','),
    ...applianceRows,
  ].join('\n');

  const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Laporan_Mingguan_Hemat_Listrik_${shopName.replace(/\s+/g, '_')}_Minggu_${report.weekNumber}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
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

type TerraDirection = 'down' | 'up' | 'left' | 'right';
type TerraWalkStep = 'left' | 'right';

const TERRA_SPRITES = {
  idle: '/Terra_diam-removebg-preview.png',
  down: {
    left: '/terra_kebawah_langkah_kiri-removebg-preview.png',
    right: '/Terra_kebawah_langkah_kanan-removebg-preview.png',
  },
  up: {
    left: '/Terra_atas_langkah_kiri-removebg-preview.png',
    right: '/Terra_atas_Langkah_Kanan-removebg-preview.png',
  },
  left: {
    left: '/terra_ke_kiri_langkah_kiri-removebg-preview.png',
    right: '/terra_kekiri_langkah_kanan-removebg-preview.png',
  },
  right: {
    left: '/Terra_kekanan_langkah_kiri-removebg-preview.png',
    right: '/Terra_ke_kanan_langkah_kanan-removebg-preview.png',
  },
} as const;

const TEMPLATE_STATION_MAP: Record<string, Record<string, StationCoord>> = {
  laundry: {
    lamp: { x: 50, y: 15, zone: 'Plafon Kios' },
    pump: { x: 14, y: 36, zone: 'Pipa & Tandon Air' },
    washer: { x: 42, y: 36, zone: 'Area Cuci Basah' },
    dryer: { x: 76, y: 36, zone: 'Area Pengering' },
    iron: { x: 20, y: 76, zone: 'Meja Setrika Uap' },
  },
  warung: {
    lamp: { x: 50, y: 19, zone: 'Plafon Warung' },
    freezer: { x: 13, y: 44, zone: 'Sudut Beku' },
    fridge: { x: 47, y: 48, zone: 'Dapur Bahan' },
    ricecooker: { x: 82, y: 44, zone: 'Meja Saji Nasi' },
    fan: { x: 18, y: 78, zone: 'Area Meja Makan' },
    blender: { x: 64, y: 74, zone: 'Bar Minuman' },
  },
  roti: {
    lamp: { x: 50, y: 19, zone: 'Plafon Bakery' },
    oven: { x: 18, y: 44, zone: 'Dapur Panggang' },
    mixer: { x: 48, y: 44, zone: 'Meja Adonan' },
    chiller: { x: 78, y: 44, zone: 'Pendingin Bahan' },
    display: { x: 25, y: 74, zone: 'Etalase Depan' },
  },
  kustom: {
    lamp: { x: 50, y: 19, zone: 'Plafon Utama' },
    fan: { x: 28, y: 74, zone: 'Area Depan' },
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
  const { settings, profile, user, gameCycle, advanceGameDay, resetGameWeek } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');
  const template = getTemplate(state.templateId);
  const result = useMemo(() => compute(state, tariffRate), [state, tariffRate]);
  const stationPositions = useMemo(
    () => computeSlotPositions(state.templateId, state.slots),
    [state.templateId, state.slots],
  );

  const [selectedUid, setSelectedUid] = useState<string | null>(state.slots[0]?.uid ?? null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showHourModal, setShowHourModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [waSharedSuccess, setWaSharedSuccess] = useState(false);
  const [dayAdvanceBanner, setDayAdvanceBanner] = useState<string | null>(null);

  // Posisi karakter Terra di dalam ruangan outlet (persentase x, y)
  const [terraPos, setTerraPos] = useState<{ x: number; y: number }>({ x: 52, y: 66 });
  const [terraDir, setTerraDir] = useState<TerraDirection>('down');
  const [terraStep, setTerraStep] = useState<TerraWalkStep>('left');
  const [terraWalking, setTerraWalking] = useState(false);
  const floorArenaRef = useRef<HTMLDivElement>(null);

  // Controller engine: Loop gerak halus tanpa blink saat tombol ditekan tahan
  const keysDownRef = useRef<Set<string>>(new Set());
  const moveAnimFrameRef = useRef<number | null>(null);
  const lastStepToggleTimeRef = useRef<number>(0);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dpadHoldingRef = useRef<{ dx: number; dy: number } | null>(null);

  // Elemen interaktif dunia game: Waktu (Siang/Sore/Malam), Aksesoris Aktif, Kucing Kios, Efek Klik Lantai, & Balon Dialog Terra
  const [timeOfDay, setTimeOfDay] = useState<'siang' | 'sore' | 'malam'>('siang');
  const [activePropId, setActivePropId] = useState<string | null>(null);
  const [catAwake, setCatAwake] = useState(false);
  const [clickMarker, setClickMarker] = useState<{ x: number; y: number; id: number } | null>(null);
  const [terraSpeech, setTerraSpeech] = useState<string | null>(null);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const worldProps = useMemo(
    () => TEMPLATE_PROPS[state.templateId] ?? TEMPLATE_PROPS.kustom ?? [],
    [state.templateId],
  );
  const totalActiveWatts = useMemo(
    () => state.slots.reduce((acc, s) => (s.on ? acc + s.appliance.power_w.typical : acc), 0),
    [state.slots],
  );

  // tutorialRunning menjaga sesi panduan tetap aktif walau pop-up ditutup sementara (close)
  const [tutorialRunning, setTutorialRunning] = useState<boolean>(initialTutorial);
  const [popupOpen, setPopupOpen] = useState<boolean>(initialTutorial);
  const [stage, setStage] = useState<TutorialStage>('pick-appliance');
  const spotlightActive = tutorialRunning && popupOpen && stage !== 'set-hours';

  const [configuredUids, setConfiguredUids] = useState<string[]>([]);

  const prevTemplateRef = useRef(state.templateId);
  const sceneRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const showTerraBubble = useCallback((text: string, durationMs = 4500) => {
    setTerraSpeech(text);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => {
      setTerraSpeech(null);
    }, durationMs);
  }, []);

  const handleAdvanceDay = useCallback(() => {
    const res = advanceGameDay();
    if (res.completedWeek) {
      showTerraBubble('🎉 Hore! Siklus 7 hari di Kios telah selesai! Laporan Mingguan Hemat Listrik resmi terbuka!', 5500);
      setShowWeeklyReportModal(true);
    } else {
      showTerraBubble(`Hari ke-${gameCycle.currentDay} selesai! Pemakaian Rp ${formatRp(result.rp_day)} tersimpan. Masuk ke Hari ke-${res.newDay}!`, 4500);
      setDayAdvanceBanner(`Hari ke-${gameCycle.currentDay} selesai (Rp ${formatRp(result.rp_day)}). Lanjut ke Hari ke-${res.newDay} dari 7!`);
      setTimeout(() => setDayAdvanceBanner(null), 3800);
    }
  }, [advanceGameDay, gameCycle.currentDay, result.rp_day, showTerraBubble]);

  // Realtime cycle simulation: Setiap 12 menit realtime berganti 1 hari game otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameCycle.currentDay < 7) {
        advanceGameDay();
      }
    }, 12 * 60 * 1000);
    return () => clearInterval(interval);
  }, [advanceGameDay, gameCycle.currentDay]);

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
      setActivePropId(null);
      setTerraSpeech(null);
    }
  }, [state.templateId]);

  useEffect(() => {
    return () => {
      if (moveAnimFrameRef.current) cancelAnimationFrame(moveAnimFrameRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
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

  const triggerWalkAnimation = useCallback((durationMs = 400) => {
    setTerraWalking(true);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      setTerraWalking(false);
    }, durationMs);
  }, []);

  // Gambar sprite Terra saat ini (diam vs langkah kaki kiri/kanan sesuai arah)
  const currentTerraSrc = useMemo(() => {
    if (!terraWalking) return TERRA_SPRITES.idle;
    const dirSprites = TERRA_SPRITES[terraDir];
    return dirSprites[terraStep] || TERRA_SPRITES.idle;
  }, [terraWalking, terraDir, terraStep]);

  // Fungsi memilih alat & menggerakkan Terra ke dekat alat tersebut
  const handlePickAppliance = useCallback(
    (uid: string, openControlStage = true) => {
      const targetPos = stationPositions[uid];
      const slotObj = state.slots.find((s) => s.uid === uid);
      setActivePropId(null);

      if (targetPos) {
        setTerraPos((prev) => {
          const nextX = clampCoord(targetPos.x + (targetPos.x > 50 ? -6 : 6), 14, 86);
          const nextY = clampCoord(targetPos.y + (targetPos.y < 30 ? 15 : 9), 28, 84);
          const dx = nextX - prev.x;
          const dy = nextY - prev.y;
          if (Math.abs(dx) >= Math.abs(dy)) {
            setTerraDir(dx < 0 ? 'left' : 'right');
          } else {
            setTerraDir(dy < 0 ? 'up' : 'down');
          }
          return { x: nextX, y: nextY };
        });
        triggerWalkAnimation(420);
      }

      if (slotObj) {
        showTerraBubble(
          `${slotObj.appliance.name} (${slotObj.appliance.power_w.typical}W) — ${
            slotObj.on ? `Menyala ${slotObj.hours} jam/hari` : 'Sedang dimatikan'
          }.`,
          3800,
        );
      }

      if (tutorialRunning && stage === 'set-hours' && selectedUid && selectedUid !== uid) {
        setConfiguredUids((prev) => Array.from(new Set([...prev, selectedUid])));
      }
      setSelectedUid(uid);

      if (openControlStage) {
        setShowHourModal(true);
        if (tutorialRunning) {
          setStage('set-hours');
        }
      }
    },
    [stationPositions, state.slots, triggerWalkAnimation, showTerraBubble, tutorialRunning, stage, selectedUid],
  );

  // Interaksi dengan aksesoris/properti kios (Rak, Keranjang, Meja Makan, Kasir, dll.)
  const handleInteractProp = useCallback(
    (prop: InteractivePropDef) => {
      setActivePropId(prop.id);
      setTerraPos((prev) => {
        const nextX = clampCoord(prop.x + (prop.x > 50 ? -5 : 5), 14, 86);
        const nextY = clampCoord(prop.y + (prop.y < 30 ? 15 : 7), 28, 84);
        const dx = nextX - prev.x;
        const dy = nextY - prev.y;
        if (Math.abs(dx) >= Math.abs(dy)) {
          setTerraDir(dx < 0 ? 'left' : 'right');
        } else {
          setTerraDir(dy < 0 ? 'up' : 'down');
        }
        return { x: nextX, y: nextY };
      });
      triggerWalkAnimation(400);
      showTerraBubble(`${prop.badge} · ${prop.tip}`, 5200);
    },
    [triggerWalkAnimation, showTerraBubble],
  );

  // Interaksi dengan Meteran PLN di dinding
  const handleInteractMeter = useCallback(() => {
    setActivePropId('pln-meter');
    setTerraDir('up');
    setTerraPos({ x: 18, y: 34 });
    triggerWalkAnimation(380);
    showTerraBubble(
      `⚡ Meteran PLN: Beban aktif ${totalActiveWatts.toLocaleString('id-ID')} Watt (${formatKwh(result.kwh_day)}/hari).`,
      4800,
    );
  }, [totalActiveWatts, result.kwh_day, triggerWalkAnimation, showTerraBubble]);

  // Interaksi dengan Kucing Penjaga Kios di Pintu Masuk
  const handleInteractCat = useCallback(() => {
    setCatAwake((v) => !v);
    setActivePropId('doorcat');
    setTerraDir('down');
    setTerraPos({ x: 46, y: 80 });
    triggerWalkAnimation(360);
    showTerraBubble(
      '🐱 Meow! Kucing penjaga kios senang kalau suhu ruangan sejuk & tagihan listrik tetap hemat!',
      4500,
    );
  }, [triggerWalkAnimation, showTerraBubble]);

  // Ganti waktu dunia game (Siang -> Sore -> Malam)
  const handleCycleTimeOfDay = useCallback(() => {
    setTimeOfDay((prev) => {
      const next = prev === 'siang' ? 'sore' : prev === 'sore' ? 'malam' : 'siang';
      const label =
        next === 'siang'
          ? '☀️ Suasana Siang: Manfaatkan cahaya alami dari jendela kios!'
          : next === 'sore'
            ? '🌅 Suasana Sore: Jam sibuk sore hari, pantau pemakaian alat pemanas!'
            : '🌙 Suasana Malam: Jangan lupa matikan alat yang tidak dipakai sebelum tutup kios!';
      showTerraBubble(label, 4200);
      return next;
    });
  }, [showTerraBubble]);

  // Gerakkan Terra dengan langkah halus tanpa blink (dipanggil tiap frame / event)
  const applyMovement = useCallback(
    (dx: number, dy: number, isContinuous = false) => {
      if (dx === 0 && dy === 0) return;

      if (Math.abs(dx) >= Math.abs(dy)) {
        setTerraDir(dx < 0 ? 'left' : 'right');
      } else {
        setTerraDir(dy < 0 ? 'up' : 'down');
      }

      setTerraWalking(true);

      const now = performance.now();
      if (now - lastStepToggleTimeRef.current > 160) {
        lastStepToggleTimeRef.current = now;
        setTerraStep((prev) => (prev === 'left' ? 'right' : 'left'));
      }

      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (!isContinuous) {
        stopTimeoutRef.current = setTimeout(() => {
          setTerraWalking(false);
        }, 220);
      }

      setTerraPos((prev) => {
        const next = {
          x: clampCoord(prev.x + dx, 12, 88),
          y: clampCoord(prev.y + dy, 26, 84),
        };

        // Cek apakah posisi baru berada di dekat salah satu alat
        let closestUid: string | null = null;
        let closestDist = 17;
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
          setActivePropId(null);
        } else {
          // Cek apakah dekat dengan salah satu aksesoris interaktif
          for (const prop of worldProps) {
            const dProp = Math.hypot(prop.x - next.x, prop.y - next.y);
            if (dProp < 15) {
              setActivePropId(prop.id);
              showTerraBubble(`${prop.badge} · ${prop.tip}`, 4200);
              break;
            }
          }
        }
        return next;
      });
    },
    [state.slots, stationPositions, worldProps, showTerraBubble],
  );

  // Loop update continuous saat tombol panah / WASD / D-pad ditahan (60 FPS smooth)
  const updateContinuousMovement = useCallback(() => {
    let vx = 0;
    let vy = 0;
    const speed = 0.58; // persentase per frame 60fps

    const keys = keysDownRef.current;
    if (keys.has('arrowleft') || keys.has('a')) vx -= speed;
    if (keys.has('arrowright') || keys.has('d')) vx += speed;
    if (keys.has('arrowup') || keys.has('w')) vy -= speed;
    if (keys.has('arrowdown') || keys.has('s')) vy += speed;

    if (dpadHoldingRef.current) {
      vx += dpadHoldingRef.current.dx * speed;
      vy += dpadHoldingRef.current.dy * speed;
    }

    if (vx !== 0 || vy !== 0) {
      applyMovement(vx, vy, true);
      moveAnimFrameRef.current = requestAnimationFrame(updateContinuousMovement);
    } else {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = setTimeout(() => {
        setTerraWalking(false);
      }, 80);
      moveAnimFrameRef.current = null;
    }
  }, [applyMovement]);

  const ensureContinuousLoop = useCallback(() => {
    if (moveAnimFrameRef.current === null) {
      moveAnimFrameRef.current = requestAnimationFrame(updateContinuousMovement);
    }
  }, [updateContinuousMovement]);

  // Handler D-Pad sentuh / tahan di layar HP & desktop
  const handleDpadStart = useCallback(
    (dx: number, dy: number) => {
      dpadHoldingRef.current = { dx, dy };
      applyMovement(dx * 2.5, dy * 2.5, true);
      ensureContinuousLoop();
    },
    [applyMovement, ensureContinuousLoop],
  );

  const handleDpadEnd = useCallback(() => {
    dpadHoldingRef.current = null;
    if (keysDownRef.current.size === 0) {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = setTimeout(() => {
        setTerraWalking(false);
      }, 90);
    }
  }, []);

  // Keyboard listener (Arrow keys / WASD) dengan tracking KeyDown & KeyUp tanpa putus-putus
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const k = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault();
        keysDownRef.current.add(k);
        ensureContinuousLoop();
      } else if (e.key === 'Enter' && nearestSlot) {
        e.preventDefault();
        handlePickAppliance(nearestSlot.uid, true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysDownRef.current.delete(k);
    };

    const onBlur = () => {
      keysDownRef.current.clear();
      dpadHoldingRef.current = null;
      setTerraWalking(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [ensureContinuousLoop, nearestSlot, handlePickAppliance]);

  // Klik di lantai outlet -> Terra berjalan ke titik tersebut + efek ripple langkah
  function handleArenaClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = floorArenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = clampCoord(((e.clientX - rect.left) / rect.width) * 100, 12, 88);
    const clickY = clampCoord(((e.clientY - rect.top) / rect.height) * 100, 26, 84);

    const dx = clickX - terraPos.x;
    const dy = clickY - terraPos.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      setTerraDir(dx < 0 ? 'left' : 'right');
    } else {
      setTerraDir(dy < 0 ? 'up' : 'down');
    }

    setClickMarker({ x: clickX, y: clickY, id: Date.now() });
    setTerraPos({ x: clickX, y: clickY });
    triggerWalkAnimation(440);

    // Jika titik klik dekat dengan salah satu alat, pilih alat tersebut
    let closestUid: string | null = null;
    let closestDist = 16;
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
      setActivePropId(null);
    }
  }

  // Ketika selesai mengatur jam pakai per hari untuk alat ini -> lanjut pilih alat berikutnya atau ke ringkasan
  function handleFinishCurrentApplianceHours() {
    const nextConfigured = selectedUid
      ? Array.from(new Set([...configuredUids, selectedUid]))
      : configuredUids;
    setConfiguredUids(nextConfigured);
    setShowHourModal(false);

    const remaining = state.slots.filter((s) => !nextConfigured.includes(s.uid));
    if (remaining.length > 0) {
      const nextSlot = remaining[0];
      if (nextSlot && stationPositions[nextSlot.uid]) {
        const targetPos = stationPositions[nextSlot.uid]!;
        setTerraPos({
          x: clampCoord(targetPos.x + (targetPos.x > 50 ? -6 : 6), 14, 86),
          y: clampCoord(targetPos.y + (targetPos.y < 30 ? 15 : 9), 28, 84),
        });
        triggerWalkAnimation(400);
      }
      setStage('pick-appliance');
      setPopupOpen(true);
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
    setShowHourModal(false);
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
          <span className="chip chip--mock">{t.kiosk.sim2d}</span>
          <span className="chip">{template.display_name}</span>
          <span className="chip">{tariffName}</span>
        </div>
        <div className="row-gap">
          <button
            type="button"
            className="terra-pill-trigger"
            onClick={() => {
              setShowHourModal(false);
              setTutorialRunning(true);
              setPopupOpen(true);
              if (configuredUids.length >= state.slots.length) {
                setStage('summary');
                setTimeout(() => {
                  summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 60);
              } else {
                setStage('pick-appliance');
                setTimeout(() => {
                  sceneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 60);
              }
            }}
          >
            <TerraAvatar mood={roomTerraMood} size={20} />
            <span>
              {t.kiosk.terraTutorial
                .replace('{done}', String(configuredUids.length))
                .replace('{total}', String(state.slots.length))}
            </span>
          </button>
          <button type="button" className="textlink" onClick={onSwitchTemplate}>
            {t.kiosk.switchBusiness}
          </button>
        </div>
      </div>

      {/* HUD SIKLUS 7 HARI DI GAME & PROGRES LAPORAN MINGGUAN */}
      <div
        className={`game-cycle-hud ${spotlightActive ? 'tutorial-dim' : ''}`}
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(45, 212, 191, 0.4)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          marginBottom: '0.85rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          <div className="row-gap" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              className="chip"
              style={{
                background: gameCycle.currentDay >= 7 ? 'linear-gradient(135deg, #059669, #0D9488)' : '#1E293B',
                color: gameCycle.currentDay >= 7 ? '#FFF' : '#2DD4BF',
                borderColor: '#2DD4BF',
                fontWeight: 700,
              }}
            >
              📅 Hari {gameCycle.currentDay} / 7 Game
            </span>

            <div className="dots" aria-label={`Hari ke-${gameCycle.currentDay} dari 7`}>
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className={i < gameCycle.currentDay ? 'is-on' : ''}
                  title={`Hari ke-${i + 1}`}
                />
              ))}
            </div>

            <span className="hint" style={{ fontSize: '0.78rem', margin: 0 }}>
              (1–2 jam realtime = 1 siklus 7 hari untuk 1 laporan hemat listrik)
            </span>
          </div>

          <div className="row-gap">
            {gameCycle.weeklyReportUnlocked || gameCycle.currentDay >= 7 ? (
              <button
                type="button"
                className="selected-tpl-pill is-active"
                style={{
                  background: 'linear-gradient(135deg, #059669, #0D9488)',
                  color: '#FFF',
                  fontWeight: 700,
                  boxShadow: '0 0 14px rgba(45, 212, 191, 0.45)',
                }}
                onClick={() => setShowWeeklyReportModal(true)}
              >
                <Icon name="bolt" size={13} />
                <span>🏆 Buka Laporan Hemat Listrik 7 Hari</span>
              </button>
            ) : (
              <button
                type="button"
                className="selected-tpl-pill"
                onClick={handleAdvanceDay}
                title="Selesaikan jam operasional hari ini dan maju ke hari berikutnya"
              >
                <Icon name="check" size={13} />
                <span>Tutup Kios Hari #{gameCycle.currentDay} (Lanjut Hari #{gameCycle.currentDay + 1}) →</span>
              </button>
            )}
          </div>
        </div>

        {dayAdvanceBanner && (
          <div
            className="notice"
            role="status"
            style={{ marginTop: '0.6rem', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          >
            <Icon name="check" size={16} />
            <div>{dayAdvanceBanner}</div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* LAYOUT GRID: Responsif di Mobile (1 Kolom) & Desktop/Tablet (Side-by-side) */}
      {/* ==================================================================== */}
      <div className="kios-stage-grid">
        <div className="kios-stage-grid__scene">
          {/* BAGIAN SCREEN 1: Dunia Game Kios 2D Interaktif Sesuai Jenis Usaha    */}
          {/* - Dunia & Aksesoris mengikuti jenis kios (Laundry/Warung/Roti/Kustom)*/}
          {/* - Karakter Terra bebas berjalan, menyentuh alat & aksesoris          */}
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
        <Bezel
          coreClassName={`scene scene--${mood} scene--time-${timeOfDay} ${
            roomLit ? 'is-lit' : 'is-dimmed'
          }`}
        >
          {/* Kanopi & Papan Nama Outlet */}
          <div className={`scene__awning scene__awning--${state.templateId}`} aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="scene__sign">
            <span>{state.shopName}</span>
          </div>

          {/* HUD Status Dunia Kios di Atas Ruangan */}
          <div className="outlet-top-banner">
            <div className="outlet-top-banner__info">
              <div className="outlet-top-banner__badges">
                <strong className="wati__name">
                  {t.kiosk.worldKiosk.replace('{template}', template.display_name)}
                </strong>
                <span className="outlet-watt-pill">
                  {t.kiosk.wattActive.replace('{watts}', totalActiveWatts.toLocaleString('id-ID'))}
                </span>
              </div>
              <p>
                {nearestSlot
                  ? t.kiosk.terraExamining
                      .replace('{appliance}', nearestSlot.appliance.name)
                      .replace(
                        '{status}',
                        nearestSlot.on
                          ? t.kiosk.terraHours.replace('{hours}', String(nearestSlot.hours))
                          : t.kiosk.terraOff,
                      )
                  : MOOD_COPY[mood].line(top?.appliance.name)}
              </p>
            </div>
            <div className="outlet-top-banner__right">
              <button
                type="button"
                className="outlet-time-btn"
                onClick={handleCycleTimeOfDay}
                title={t.kiosk.timeCycleTooltip}
              >
                {timeOfDay === 'siang'
                  ? t.kiosk.timeDay
                  : timeOfDay === 'sore'
                    ? t.kiosk.timeEve
                    : t.kiosk.timeNight}
              </button>
            </div>
          </div>

          {/* Arena Dunia Game Kios 2.5D Sesuai Pilihan Usaha */}
          <div
            ref={floorArenaRef}
            className={`outlet-arena outlet-arena--${state.templateId} outlet-arena--${timeOfDay}`}
            onClick={handleArenaClick}
            role="region"
            aria-label={`Dunia Game ${state.shopName}. Ketuk lantai, alat, atau aksesoris untuk menggerakkan Terra.`}
          >
            {/* Dinding Belakang: Pipa/Dekorasi, Meteran PLN Interaktif, & Jendela Waktu Interaktif */}
            <div className="outlet-wall">
              <div className="outlet-wall__trim" aria-hidden="true" />

              {/* Meteran Listrik PLN Interaktif */}
              <button
                type="button"
                className={`outlet-meter-box ${activePropId === 'pln-meter' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteractMeter();
                }}
                title="Ketuk untuk memeriksa beban Meteran Listrik PLN bersama Terra"
              >
                <span className="outlet-meter-box__led" />
                <span className="outlet-meter-box__label">
                  PLN {totalActiveWatts.toLocaleString('id-ID')}W
                </span>
              </button>

              {/* Jendela Kios Interaktif (Klik untuk ganti Siang / Sore / Malam) */}
              <button
                type="button"
                className="scene__window outlet-window-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCycleTimeOfDay();
                }}
                title="Ketuk jendela untuk mengganti waktu Siang / Sore / Malam"
              >
                <span className={`scene__sky scene__sky--${timeOfDay} scene__sky--${mood}`}>
                  <span className="scene__celestial" aria-hidden="true">
                    {timeOfDay === 'siang' ? '☀️' : timeOfDay === 'sore' ? '🌤️' : '🌙'}
                  </span>
                </span>
                <span className="scene__window-sill" aria-hidden="true" />
              </button>
            </div>

            {/* Sorot Cahaya Lampu Plafon Saat Menyala */}
            {roomLit && <div className="outlet-light-cone" aria-hidden="true" />}

            {/* Karpet & Penanda Area Lantai Sesuai Jenis Usaha */}
            <div className="outlet-zones" aria-hidden="true">
              <div className="outlet-zone outlet-zone--back" />
              <div className="outlet-zone outlet-zone--front-left" />
            </div>

            {/* Aksesoris & Properti Interaktif Sesuai Jenis Kios */}
            {worldProps.map((prop) => {
              const isPropActive = activePropId === prop.id;
              const isWallProp = prop.y <= 26;
              return (
                <button
                  key={prop.id}
                  type="button"
                  style={{ left: `${prop.x}%`, top: `${prop.y}%` }}
                  className={`outlet-prop ${isWallProp ? 'outlet-prop--wall' : 'outlet-prop--floor'} ${
                    isPropActive ? 'is-active' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteractProp(prop);
                  }}
                  title={`${prop.name} — Ketuk agar Terra memeriksa`}
                >
                  <span className="outlet-prop__badge">{prop.badge}</span>
                  <span className="outlet-prop__art">
                    <OutletPropArt id={prop.id} active={isPropActive} />
                  </span>
                  <span className="outlet-prop__name">{prop.name}</span>
                </button>
              );
            })}

            {/* Pintu Masuk & Kucing Maskot Penjaga Kios Interaktif */}
            <button
              type="button"
              className={`outlet-door-cat ${catAwake ? 'is-awake' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleInteractCat();
              }}
              title="Ketuk kucing penjaga pintu kios!"
            >
              <span className="outlet-door-cat__art">
                <ShopCatArt awake={catAwake} />
              </span>
              <span className="outlet-door-cat__label">
                {catAwake ? '😺 Meow! Selamat Datang' : '🐾 Pintu Masuk Kios'}
              </span>
            </button>

            {/* Lingkaran Efek Target Langkah di Lantai Saat Diklik */}
            {clickMarker && (
              <span
                key={clickMarker.id}
                className="outlet-click-marker"
                style={{ left: `${clickMarker.x}%`, top: `${clickMarker.y}%` }}
                aria-hidden="true"
              />
            )}

            {/* Stasiun Alat Listrik di Dalam Dunia Kios (Tidak Kaku, dengan Pedestal & Efek Hidup) */}
            {state.slots.map((s) => {
              const r = result.per_slot[s.uid];
              const active = s.uid === selectedUid;
              const isTop = top?.uid === s.uid;
              const isDone = configuredUids.includes(s.uid);
              const isNear = nearestSlot?.uid === s.uid;
              const pos = stationPositions[s.uid] ?? { x: 50, y: 50, zone: 'Lantai' };
              const isCeiling = s.appliance.icon === 'lamp';

              return (
                <div
                  key={s.uid}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className={`outlet-station-wrap ${
                    isCeiling ? 'outlet-station-wrap--ceiling' : ''
                  } ${active ? 'is-active' : ''} ${isNear ? 'is-near-terra' : ''}`}
                >
                  {/* Tombol Power Cepat ON/OFF Langsung di Atas Alat */}
                  <button
                    type="button"
                    className={`outlet-station__pwr ${s.on ? 'is-on' : 'is-off'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (s.appliance.critical) {
                        showTerraBubble(
                          `🔒 ${s.appliance.name} adalah alat wajib usaha yang harus tetap menyala!`,
                          3200,
                        );
                        return;
                      }
                      onChange(toggleSlot(state, s.uid));
                      showTerraBubble(
                        `${s.appliance.name} ${!s.on ? 'dinyalakan ⚡' : 'dimatikan 💤'}!`,
                        2800,
                      );
                    }}
                    title={
                      s.appliance.critical
                        ? `${s.appliance.name} wajib menyala`
                        : s.on
                          ? `Matikan ${s.appliance.name}`
                          : `Nyalakan ${s.appliance.name}`
                    }
                    aria-label={s.on ? `Matikan ${s.appliance.name}` : `Nyalakan ${s.appliance.name}`}
                  >
                    {s.appliance.critical ? 'WAJIB' : s.on ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
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

                    {/* Efek Partikel Hidup Saat Alat Menyala */}
                    {s.on && (
                      <span className="outlet-station__fx" aria-hidden="true">
                        {s.appliance.category === 'heater'
                          ? '♨️'
                          : s.appliance.category === 'cooling'
                            ? '❄️'
                            : s.appliance.icon === 'washer'
                              ? '🫧'
                              : s.appliance.icon === 'pump'
                                ? '💧'
                                : '⚡'}
                      </span>
                    )}

                    <span className="outlet-station__art">
                      <ApplianceArt icon={s.appliance.icon} on={s.on} />
                    </span>

                    {/* Alas Dudukan 3D Isometrik di Lantai */}
                    {!isCeiling && <span className="outlet-station__pad" aria-hidden="true" />}

                    <span className="outlet-station__hud">
                      <span className="outlet-station__name">{s.appliance.name}</span>
                      <span className="outlet-station__meta">
                        {s.on && r ? `${formatRp(r.rp_hour)}/j · ${s.hours}j` : 'Mati'}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}

            {/* Karakter Terra yang Bisa Digerakkan di Dalam Dunia Kios */}
            <div
              className={`outlet-terra ${terraWalking ? 'is-walking' : 'is-idle'} outlet-terra--dir-${terraDir}`}
              style={{ left: `${terraPos.x}%`, top: `${terraPos.y}%` }}
            >
              {/* Gelembung Dialog Interaktif di Atas Kepala Terra */}
              {terraSpeech && (
                <div className="outlet-terra__speech" role="status">
                  <span>{terraSpeech}</span>
                </div>
              )}

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
                    showTerraBubble(
                      '👋 Halo! Ketuk lantai, alat listrik, atau aksesoris toko untuk berkeliling bersama Terra!',
                      4200,
                    );
                  }
                }}
                title="Karakter Terra — Ketuk alat atau aksesoris untuk berkeliling memeriksa kios"
              >
                <img
                  src={currentTerraSrc}
                  alt={`Terra ${terraWalking ? `berjalan ke ${terraDir}` : 'diam'}`}
                  className="outlet-terra__sprite"
                  width={68}
                  height={68}
                  draggable={false}
                />
              </button>
              <span className="outlet-terra__shadow" aria-hidden="true" />
            </div>
          </div>

          {/* Kontrol Gamepad / D-Pad + Tombol Interaksi Cepat */}
          <div className="outlet-controls">
            <div className="outlet-dpad" role="group" aria-label="Kendali gerak karakter Terra">
              <button
                type="button"
                className="outlet-dpad__btn"
                aria-label="Gerakkan Terra ke kiri"
                onMouseDown={() => handleDpadStart(-1, 0)}
                onMouseUp={handleDpadEnd}
                onMouseLeave={handleDpadEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDpadStart(-1, 0);
                }}
                onTouchEnd={handleDpadEnd}
                onTouchCancel={handleDpadEnd}
              >
                ◀
              </button>
              <div className="outlet-dpad__vert">
                <button
                  type="button"
                  className="outlet-dpad__btn"
                  aria-label="Gerakkan Terra ke atas"
                  onMouseDown={() => handleDpadStart(0, -1)}
                  onMouseUp={handleDpadEnd}
                  onMouseLeave={handleDpadEnd}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleDpadStart(0, -1);
                  }}
                  onTouchEnd={handleDpadEnd}
                  onTouchCancel={handleDpadEnd}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="outlet-dpad__btn"
                  aria-label="Gerakkan Terra ke bawah"
                  onMouseDown={() => handleDpadStart(0, 1)}
                  onMouseUp={handleDpadEnd}
                  onMouseLeave={handleDpadEnd}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleDpadStart(0, 1);
                  }}
                  onTouchEnd={handleDpadEnd}
                  onTouchCancel={handleDpadEnd}
                >
                  ▼
                </button>
              </div>
              <button
                type="button"
                className="outlet-dpad__btn"
                aria-label="Gerakkan Terra ke kanan"
                onMouseDown={() => handleDpadStart(1, 0)}
                onMouseUp={handleDpadEnd}
                onMouseLeave={handleDpadEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDpadStart(1, 0);
                }}
                onTouchEnd={handleDpadEnd}
                onTouchCancel={handleDpadEnd}
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
                  }}
                  title={t.kiosk.modalTitle}
                >
                  <Icon name="pencil" size={14} />
                  <span>
                    {t.kiosk.checkHours
                      .replace('{appliance}', selected.appliance.name)
                      .replace(
                        '{hours}',
                        selected.on
                          ? `${selected.hours}${settings.language === 'en' ? 'h' : 'j'}`
                          : t.kiosk.terraOff,
                      )}
                  </span>
                </button>
              )}
              {isKustom && (
                <button
                  type="button"
                  className="outlet-add-btn"
                  onClick={() => setShowCatalog((v) => !v)}
                >
                  <span>{t.kiosk.addAppliance}</span>
                </button>
              )}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* POP-UP MODAL: Pengaturan Jam Pakai Pas di Atas Game (Tanpa Scroll)   */}
          {/* ==================================================================== */}
          {selected && showHourModal && (
            <div
              ref={controlRef}
              className="outlet-modal-backdrop"
              onClick={() => {
                setShowHourModal(false);
                if (tutorialRunning && stage === 'set-hours') {
                  setStage('pick-appliance');
                }
              }}
            >
              <div
                className="outlet-modal-dialog"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={t.kiosk.modalTitle}
              >
                <div className="outlet-modal-header">
                  <span className="outlet-modal-title">{t.kiosk.modalTitle}</span>
                  <button
                    type="button"
                    className="outlet-modal-close"
                    onClick={() => {
                      setShowHourModal(false);
                      if (tutorialRunning && stage === 'set-hours') {
                        setStage('pick-appliance');
                      }
                    }}
                    aria-label="Tutup pop up"
                  >
                    ✕
                  </button>
                </div>

                {tutorialRunning && (
                  <div className="outlet-modal-terra-hint">
                    <TerraAvatar mood="mikir" size={32} />
                    <div className="outlet-modal-terra-hint__body">
                      <strong>Langkah 2/3 · Atur Jam Pakai</strong>
                      <span>
                        {selected.appliance.usage_pattern.always_on
                          ? `${selected.appliance.name} aktif 24 jam penuh. Klik tombol simpan di bawah untuk melanjutkan.`
                          : `Geser jam pakai per hari untuk ${selected.appliance.name}, lalu klik simpan.`}
                      </span>
                    </div>
                  </div>
                )}

                <ApplianceControl
                  key={selected.uid}
                  slot={selected}
                  zoneName={stationPositions[selected.uid]?.zone}
                  rpDay={result.per_slot[selected.uid]?.rp_day ?? 0}
                  rpHour={result.per_slot[selected.uid]?.rp_hour ?? 0}
                  kwh={result.per_slot[selected.uid]?.kwh ?? 0}
                  removable={isKustom || state.slots.length > 1}
                  showTutorialNext={tutorialRunning}
                  nextLabel={
                    remainingCount > 1 || (remainingCount === 1 && !configuredUids.includes(selected.uid))
                      ? 'Simpan & Pilih Alat Berikutnya'
                      : 'Simpan & Lihat Ringkasan Tagihan'
                  }
                  onNextAppliance={handleFinishCurrentApplianceHours}
                  onHours={(h) => onChange(setHours(state, selected.uid, h))}
                  onToggle={() => onChange(toggleSlot(state, selected.uid))}
                  onRemove={() => {
                    onChange(removeSlot(state, selected.uid), true);
                    setSelectedUid(null);
                    setShowHourModal(false);
                    if (tutorialRunning) {
                      setStage('pick-appliance');
                      setPopupOpen(true);
                    }
                  }}
                />
              </div>
            </div>
          )}
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
                    setShowHourModal(true);
                    if (tutorialRunning) {
                      setStage('set-hours');
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
    </div>

    {/* BAGIAN SCREEN 3: Tagihan Simulasi & Lanjutkan ke Aplikasi Utama      */}
    {/* Pop-out tajam saat `stage === 'summary'`, ngeblur saat tahap 1 & 2    */}
    <div className="kios-stage-grid__summary">
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
            <Eyebrow tone="light">{t.kiosk.billTitle}</Eyebrow>
            <span className={`mood mood--${mood}`}>{MOOD_COPY[mood].label}</span>
          </div>
          <p className="bill__rp">{formatRp(result.rp_day)}</p>
          <p className="bill__meta">
            {formatKwh(result.kwh_day)} · {t.kiosk.billMetaStart.replace('{baseline}', formatRp(baseline))} ·{' '}
            <strong className={changePct > 0 ? 'is-down' : changePct < 0 ? 'is-up' : ''}>
              {changePct > 0
                ? t.kiosk.billDown.replace('{pct}', String(changePct))
                : changePct < 0
                  ? t.kiosk.billUp.replace('{pct}', String(Math.abs(changePct)))
                  : t.kiosk.billSame}
            </strong>
          </p>

          <div className="challenge">
            <div className="row-between">
              <span className="challenge__title">
                <Icon name="leaf" size={16} />{' '}
                {t.kiosk.challengeTitle.replace('{pct}', String(Math.round(CHALLENGE_TARGET * 100)))}
              </span>
              <span className="challenge__pct">{Math.round(progress * 100)}%</span>
            </div>
            <div className="meter-line" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className="hint">
              {t.kiosk.challengeHint.replace('{hours}', String(OPEN_HOURS))}
            </p>
          </div>
        </Bezel>

        <Bezel tone="moss" coreClassName="twin">
          <Eyebrow>{t.kiosk.syncTitle}</Eyebrow>
          <p className="twin__title">
            {t.kiosk.syncHeader}
          </p>
          <p className="hint">{t.kiosk.syncHint}</p>
          <div className="capture__actions">
            <IslandLink href="/biaya" icon="chart" onClick={handleCompleteTutorial}>
              {t.kiosk.viewCost}
            </IslandLink>
            <IslandLink href="/" variant="ghost" icon="home" onClick={handleCompleteTutorial}>
              {t.kiosk.toHome}
            </IslandLink>
          </div>
        </Bezel>
      </div>
    </div>
  </div>

      {/* ==================================================================== */}
      {/* TUTORIAL GAME TERRA (DIRENDER KE BODY DI ATAS NAVBAR)                */}
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
              ? `Gerakkan karakter Terra mendekati "${nextUnconfiguredSlot.appliance.name}" atau ketuk langsung alatnya di denah untuk mengatur jam pakainya.`
              : 'Ketuk salah satu alat pada denah outlet di atas untuk mengatur jam pakainya.'
          }
          primaryLabel={configuredUids.length > 0 ? 'Selesai & Lihat Tagihan' : undefined}
          onPrimaryAction={configuredUids.length > 0 ? handleJumpToSummary : undefined}
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
            setShowHourModal(false);
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

      {/* ==================================================================== */}
      {/* MODAL RAPOR MINGGUAN HEMAT LISTRIK (SIKLUS 7 HARI DI GAME)            */}
      {/* ==================================================================== */}
      {showWeeklyReportModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="kios-modal-backdrop"
          onClick={() => setShowWeeklyReportModal(false)}
        >
          <div
            className="kios-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Rapor */}
            <div className="row-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.45rem', marginBottom: '0.55rem' }}>
              <div>
                <div className="row-gap" style={{ alignItems: 'center', gap: '0.35rem' }}>
                  <span className="chip" style={{ background: '#10B981', color: '#FFFFFF', border: '1px solid #059669', fontSize: '0.72rem', padding: '0.15rem 0.55rem', fontWeight: 700 }}>
                    🏆 Rapor Hemat Listrik 7 Hari
                  </span>
                  <span className="chip" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.18)', fontSize: '0.7rem', padding: '0.15rem 0.45rem', fontWeight: 600 }}>
                    Tarif {tariffName}
                  </span>
                </div>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Minggu ke-{gameCycle.weeklyReport?.weekNumber || 1} · {state.shopName}
                </h3>
              </div>
              <button
                type="button"
                className="outlet-modal-close"
                onClick={() => setShowWeeklyReportModal(false)}
                aria-label="Tutup Rapor"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  width: '1.6rem',
                  height: '1.6rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Skor Efisiensi & Metrik Utama (1 Baris Grid Dua Kolom) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.5rem', marginBottom: '0.55rem' }}>
              {/* Box Grade (Gradasi Hijau Segar) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #059669, #10B981)',
                  border: '1px solid #34D399',
                  borderRadius: '10px',
                  padding: '0.5rem 0.4rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 4px 14px -2px rgba(16, 185, 129, 0.35)',
                }}
              >
                <span className="eyebrow" style={{ fontSize: '0.66rem', letterSpacing: '0.04em', color: '#FFFFFF', opacity: 0.9 }}>
                  SKOR EFISIENSI
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, margin: '0.1rem 0' }}>
                  Grade {gameCycle.weeklyReport?.grade || 'A'}
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Efisiensi {gameCycle.weeklyReport?.efficiencyPct || 92}%
                </span>
              </div>

              {/* 2 Metrik Ringkas Pengeluaran & Hemat */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.22)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.4rem 0.6rem' }}>
                  <span style={{ fontSize: '0.68rem', color: '#CBD5E1' }}>Pengeluaran 7 Hari</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.1rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>
                      {formatRp(gameCycle.weeklyReport?.totalRp || Math.round(result.rp_day * 7))}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                      {gameCycle.weeklyReport?.totalKwh || (result.kwh_day * 7).toFixed(1)} kWh
                    </span>
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.45)', borderLeft: '3.5px solid #10B981', borderRadius: '8px', padding: '0.4rem 0.6rem' }}>
                  <span style={{ fontSize: '0.68rem', color: '#34D399', fontWeight: 600 }}>Potensi Hemat Didapat</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.1rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>
                      {formatRp(gameCycle.weeklyReport?.savedRp || 32500)}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>
                      Hemat {gameCycle.weeklyReport?.savedKwh || 22.5} kWh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sorotan Alat: Paling Optimal vs Boros (2 Kolom Compact) */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0.45rem 0.65rem', marginBottom: '0.55rem' }}>
              <div className="row-between" style={{ fontSize: '0.68rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#FFFFFF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Evaluasi Peralatan Listrik
                </span>
                <span style={{ color: '#10B981', fontSize: '0.68rem', fontWeight: 700 }}>Terkontrol</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.18)', borderRadius: '6px', padding: '0.35rem 0.5rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <span style={{ fontSize: '0.66rem', color: '#34D399', fontWeight: 600, display: 'block' }}>🌟 Paling Efisien</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {gameCycle.weeklyReport?.bestAppliance || 'Mesin Cuci Front Loading'}
                  </strong>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '0.35rem 0.5rem', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  <span style={{ fontSize: '0.66rem', color: '#F59E0B', fontWeight: 600, display: 'block' }}>⚠️ Beban Terbesar</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {gameCycle.weeklyReport?.wastefulAppliance || 'Pengering Komersial'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Riwayat 7 Hari Operasional Mini Strip */}
            <div style={{ marginBottom: '0.65rem' }}>
              <div className="row-between" style={{ marginBottom: '0.25rem', fontSize: '0.68rem' }}>
                <span style={{ color: '#CBD5E1' }}>Catatan 7 Hari Operasional Kios</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>7/7 Hari Selesai ✓</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                  <div
                    key={day}
                    style={{
                      background: 'rgba(16, 185, 129, 0.16)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '5px',
                      padding: '0.25rem 0.15rem',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.64rem', color: '#CBD5E1', display: 'block' }}>{day}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981' }}>✓</span>
                  </div>
                ))}
              </div>
            </div>

            {waSharedSuccess && (
              <div className="notice" role="status" style={{ marginBottom: '0.55rem', padding: '0.35rem 0.6rem', fontSize: '0.76rem', background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981', color: '#FFFFFF' }}>
                <Icon name="check" size={14} />
                <div>Ringkasan rapor berhasil dikirim ke WhatsApp ({user.phone})!</div>
              </div>
            )}

            {/* Aksi Unduh, Kirim WA, & Mulai Siklus Baru */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.45rem' }}>
                <button
                  type="button"
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.6rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                  }}
                  onClick={() => {
                    const rep = gameCycle.weeklyReport || {
                      weekNumber: 1,
                      grade: 'A',
                      efficiencyPct: 92,
                      totalKwh: Number((result.kwh_day * 7).toFixed(1)),
                      totalRp: Math.round(result.rp_day * 7),
                      savedKwh: 22.5,
                      savedRp: 32500,
                      bestAppliance: 'Mesin Cuci Front Loading',
                      wastefulAppliance: top?.appliance.name || 'Pengering',
                      generatedAt: new Date().toLocaleDateString('id-ID'),
                    };
                    downloadWeeklyReportCsv(state.shopName, template.display_name, tariffName, rep, state.slots);
                  }}
                >
                  <Icon name="tag" size={13} />
                  <span>Unduh CSV</span>
                </button>

                <button
                  type="button"
                  className="selected-tpl-pill"
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    borderColor: '#10B981',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onClick={() => {
                    setWaSharedSuccess(true);
                    setTimeout(() => setWaSharedSuccess(false), 3500);
                  }}
                  title="Kirim notifikasi ringkasan ke nomor WhatsApp Anda"
                >
                  <Icon name="phone" size={13} />
                  <span>Kirim WA</span>
                </button>
              </div>

              <div className="row-between" style={{ alignItems: 'center', marginTop: '0.15rem' }}>
                <button
                  type="button"
                  className="textlink"
                  style={{ fontSize: '0.76rem', color: '#10B981', fontWeight: 700 }}
                  onClick={() => {
                    resetGameWeek();
                    setShowWeeklyReportModal(false);
                    showTerraBubble('Siklus Minggu baru dimulai! Mari optimalkan lagi pemakaian listrik Kios!', 4500);
                  }}
                >
                  🔄 Mulai Minggu Baru
                </button>

                <button
                  type="button"
                  className="textlink"
                  style={{ fontSize: '0.76rem', color: '#CBD5E1' }}
                  onClick={() => setShowWeeklyReportModal(false)}
                >
                  Tutup Rapor
                </button>
              </div>
            </div>
          </div>
        </div>
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
  nextLabel,
  onNextAppliance,
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
  nextLabel?: string;
  onNextAppliance?: () => void;
  onHours: (h: number) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { settings } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');
  const a = slot.appliance;
  const bounds = hourBounds(a);
  const alwaysOn = a.usage_pattern.always_on;
  const pct = bounds.max > bounds.min ? ((slot.hours - bounds.min) / (bounds.max - bounds.min)) * 100 : 100;

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
            {a.critical && <span className="chip chip--high">{settings.language === 'en' ? 'Required' : 'Wajib'}</span>}
          </div>
        </div>
        {!a.critical && (
          <button
            type="button"
            role="switch"
            aria-checked={slot.on}
            aria-label={slot.on ? 'Matikan alat' : 'Nyalakan alat'}
            className={`switch ${slot.on ? 'is-on' : ''}`}
            onClick={onToggle}
          >
            <span />
          </button>
        )}
      </div>

      <div className="control__stats">
        <div>
          <span>{t.kiosk.perDay}</span>
          <strong>{formatRp(rpDay)}</strong>
        </div>
        <div>
          <span>{t.kiosk.perHour}</span>
          <strong>{formatRp(rpHour)}</strong>
        </div>
        <div>
          <span>{t.kiosk.energy}</span>
          <strong>{formatKwh(kwh)}</strong>
        </div>
      </div>

      {alwaysOn ? (
        <p className="hint">
          <Icon name="info" size={14} /> {t.kiosk.alwaysOnHint}
        </p>
      ) : (
        <label className="slider">
          <span className="row-between">
            <span>{t.kiosk.hoursPerDay}</span>
            <strong>
              {slot.on
                ? `${slot.hours} ${settings.language === 'en' ? 'hrs' : 'jam'}`
                : t.kiosk.terraOff}
            </strong>
          </span>
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={0.5}
            value={slot.hours}
            disabled={!slot.on}
            onChange={(e) => onHours(Number(e.target.value))}
            style={{ ['--pct' as string]: `${pct}%` }}
          />
          <span className="row-between slider__scale">
            <span>{bounds.min} {settings.language === 'en' ? 'hrs' : 'jam'}</span>
            <span>{bounds.max} {settings.language === 'en' ? 'hrs' : 'jam'}</span>
          </span>
        </label>
      )}

      {showTutorialNext && onNextAppliance && (
        <div className="capture__actions">
          <IslandButton
            icon="check"
            onClick={onNextAppliance}
          >
            {nextLabel || t.kiosk.saveAndNext}
          </IslandButton>
        </div>
      )}

      {removable && !a.critical && (
        <button type="button" className="textlink" onClick={onRemove}>
          {t.kiosk.removeAppliance}
        </button>
      )}
    </Bezel>
  );
}
