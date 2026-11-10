'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { OcrLabelResponse, OcrMeterResponse } from '@voltra/contracts';
import { Bezel, ConfidenceBadge, Eyebrow, IslandButton, MockBadge } from '@/components/ui/primitives';
import { Icon, type IconName } from '@/components/ui/icon';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import {
  OCR_METER,
  PROVIDER_ERROR,
  WARNING_TEXT,
  type CaptureScenario,
} from '@/lib/mock-data';

type Mode = 'meter' | 'label' | 'voice' | 'manual';

const MODES: Array<{ id: Mode; label: string; icon: IconName }> = [
  { id: 'meter', label: 'Meter', icon: 'meter' },
  { id: 'label', label: 'Label alat', icon: 'tag' },
  { id: 'voice', label: 'Suara', icon: 'mic' },
  { id: 'manual', label: 'Manual', icon: 'pencil' },
];

const SCENARIOS: Array<{ id: CaptureScenario; label: string }> = [
  { id: 'success', label: 'Sukses' },
  { id: 'low_confidence', label: 'Keyakinan rendah' },
  { id: 'provider_error', label: 'Gagal' },
];

/** Simulasi latensi AI Gateway mock. */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function CaptureFlow() {
  const { profile } = useVoltraApp();
  const template = getTemplate(profile.templateId);
  const [mode, setMode] = useState<Mode>('meter');
  const [scenario, setScenario] = useState<CaptureScenario>('success');
  const [manualPrefill, setManualPrefill] = useState<string>('');

  function toManual(prefill = '') {
    setManualPrefill(prefill);
    setMode('manual');
  }

  return (
    <>
      <div className="row-between kios-toolbar" style={{ marginBottom: '0.75rem' }}>
        <div className="row-gap">
          <span className="chip">{profile.businessName}</span>
          <span className="chip chip--high">{template.display_name}</span>
        </div>
        <Link href="/kios" className="textlink">
          Lihat Kios 2D
        </Link>
      </div>

      <div className="modes" role="tablist" aria-label="Cara mencatat" style={{ marginBottom: '1.25rem' }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`modes__item ${mode === m.id ? 'is-active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            <Icon name={m.icon} size={20} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div key={`${profile.templateId}-${mode}`} className="swap">
        {mode === 'meter' && <PhotoCapture kind="meter" scenario={scenario} onManual={toManual} />}
        {mode === 'label' && <PhotoCapture kind="label" scenario={scenario} onManual={toManual} />}
        {mode === 'voice' && <VoiceCapture scenario={scenario} onManual={() => toManual()} />}
        {mode === 'manual' && <ManualForm prefill={manualPrefill} />}
      </div>
    </>
  );
}

/* ====================================================================== */
/*  Foto meter / label                                                     */
/* ====================================================================== */

type PhotoPhase =
  | { kind: 'pick' }
  | { kind: 'preview' }
  | { kind: 'processing' }
  | { kind: 'meter'; data: OcrMeterResponse }
  | { kind: 'label'; data: OcrLabelResponse }
  | { kind: 'error' }
  | { kind: 'saved'; summary: string };

const PHOTO_COPY = {
  meter: {
    title: 'Foto meter listrik',
    hint: 'Arahkan kamera tegak lurus dan pastikan angka meter terbaca jelas.',
    action: 'Baca angka',
  },
  label: {
    title: 'Foto label alat',
    hint: 'Dekatkan kamera ke stiker spesifikasi daya listrik (Watt) alat.',
    action: 'Baca label',
  },
} as const;

const TEMPLATE_APPLIANCE_CATALOG: Record<string, Array<{ name: string; brand: string; power_w: number }>> = {
  laundry: [
    { name: 'Pengering Heavy Duty', brand: 'Speed Queen', power_w: 3200 },
    { name: 'Setrika Uap Boiler', brand: 'Nagamoto', power_w: 1200 },
    { name: 'Mesin Cuci Front Loading', brand: 'LG Inverter', power_w: 550 },
    { name: 'Pompa Booster Air', brand: 'Shimizu', power_w: 250 },
    { name: 'Exhaust Fan Kios', brand: 'Panasonic', power_w: 75 },
  ],
  warung: [
    { name: 'Freezer Box Daging & Es', brand: 'RSA', power_w: 260 },
    { name: 'Rice Cooker Jumbo 10L', brand: 'Miyako', power_w: 1250 },
    { name: 'Showcase Cooler Minuman', brand: 'Polytron', power_w: 190 },
    { name: 'Blender Komersial Sambal', brand: 'Philips', power_w: 350 },
  ],
  kafe: [
    { name: 'Mesin Espresso 2 Group', brand: 'La Marzocco', power_w: 2800 },
    { name: 'Coffee Grinder Otomatis', brand: 'Eureka', power_w: 350 },
    { name: 'Ice Maker Machine 50kg', brand: 'Hoshizaki', power_w: 420 },
    { name: 'Blender Ice Crusher', brand: 'Vitamix', power_w: 1100 },
  ],
  bengkel: [
    { name: 'Kompresor Udara 2 HP', brand: 'Shark', power_w: 1500 },
    { name: 'Mesin Las Inverter IGBT', brand: 'Lakoni', power_w: 900 },
    { name: 'Gerinda Tangan 4 Inch', brand: 'Makita', power_w: 540 },
    { name: 'Bor Duduk Bench Drill', brand: 'Modern', power_w: 375 },
  ],
};

function PhotoCapture({
  kind,
  scenario,
  onManual,
}: {
  kind: 'meter' | 'label';
  scenario: CaptureScenario;
  onManual: (prefill?: string) => void;
}) {
  const { profile, analytics, addCustomAppliance, recordDataUpdate } = useVoltraApp();
  const [phase, setPhase] = useState<PhotoPhase>({ kind: 'pick' });
  const [preview, setPreview] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const copy = PHOTO_COPY[kind];

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setPhase({ kind: 'preview' });
    e.target.value = '';
  }

  async function read() {
    setPhase({ kind: 'processing' });
    await wait(1400);
    if (scenario === 'provider_error') return setPhase({ kind: 'error' });

    if (kind === 'meter') {
      const count = profile.recordCount ?? 1;
      // Angka meter dinamis bertambah logis seiring pencatatan harian
      const baseMeter = 12345.6;
      const dynamicDelta = (count - 1) * 18.4 + (preview ? 3.2 : 0);
      const computedKwh = Number((baseMeter + dynamicDelta).toFixed(1));

      const meterResponse: OcrMeterResponse = {
        request_id: `r_ocr_meter_${Date.now()}`,
        engine_version: 'ocr-meter-0.1.0',
        mode: 'hybrid',
        confidence: scenario === 'low_confidence' ? 'low' : 'high',
        warnings: scenario === 'low_confidence' ? ['decimal_digit_uncertain'] : [],
        kwh: computedKwh,
        unit: 'kWh',
        digits_confidence: [0.99, 0.98, 0.97, 0.96, 0.92, 0.95],
        needs_retake: scenario === 'low_confidence',
      };
      setPhase({ kind: 'meter', data: meterResponse });
    } else {
      const catalog = TEMPLATE_APPLIANCE_CATALOG[profile.templateId] ?? TEMPLATE_APPLIANCE_CATALOG.laundry!;
      const count = profile.recordCount ?? 1;
      const appIndex = (count - 1) % catalog.length;
      const detectedApp = catalog[appIndex]!;

      const labelResponse: OcrLabelResponse = {
        request_id: `r_ocr_label_${Date.now()}`,
        engine_version: 'ocr-label-0.1.0',
        mode: 'hybrid',
        confidence: scenario === 'low_confidence' ? 'low' : 'high',
        warnings: scenario === 'low_confidence' ? ['power_unit_uncertain'] : [],
        name: detectedApp.name,
        brand: detectedApp.brand,
        power_w: detectedApp.power_w,
        needs_retake: scenario === 'low_confidence',
      };
      setPhase({ kind: 'label', data: labelResponse });
    }
  }

  function reset() {
    setPreview(null);
    setPhase({ kind: 'pick' });
  }

  const inputs = (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onFile} />
    </>
  );

  if (phase.kind === 'saved') {
    return <Saved summary={phase.summary} onAgain={reset} />;
  }

  if (phase.kind === 'pick') {
    return (
      <Bezel coreClassName="capture">
        {inputs}
        <div className="viewfinder">
          <span className="viewfinder__corner viewfinder__corner--tl" />
          <span className="viewfinder__corner viewfinder__corner--tr" />
          <span className="viewfinder__corner viewfinder__corner--bl" />
          <span className="viewfinder__corner viewfinder__corner--br" />
          <Icon name={kind === 'meter' ? 'meter' : 'tag'} size={40} />
          <p>{copy.title}</p>
        </div>
        <p className="hint" style={{ margin: '0.45rem 0 0.85rem', textAlign: 'center' }}>
          {copy.hint}
        </p>
        <div className="capture__actions">
          <IslandButton icon="capture" onClick={() => cameraRef.current?.click()}>
            Buka kamera
          </IslandButton>
          <IslandButton variant="ghost" icon="image" onClick={() => galleryRef.current?.click()}>
            Dari galeri
          </IslandButton>
          <IslandButton variant="ghost" icon="bolt" onClick={read}>
            Gunakan contoh
          </IslandButton>
        </div>
        <button type="button" className="textlink" onClick={() => onManual()}>
          Kamera tidak bisa? Isi manual
        </button>
      </Bezel>
    );
  }

  const processing = phase.kind === 'processing';

  return (
    <div className="stack-gap">
      {preview && (
        <Bezel coreClassName="photo">
          {inputs}
          <div className={`photo__frame ${processing ? 'is-scanning' : ''}`}>
            <img src={preview} alt="Pratinjau foto" />
            <span className="photo__scan" aria-hidden="true" />
          </div>
          {(phase.kind === 'preview' || processing) && (
            <div className="capture__actions">
              <IslandButton icon="bolt" onClick={read} disabled={processing}>
                {processing ? 'Membaca…' : copy.action}
              </IslandButton>
              <IslandButton variant="ghost" icon="retry" onClick={reset} disabled={processing}>
                Ganti foto
              </IslandButton>
            </div>
          )}
        </Bezel>
      )}

      {!preview && processing && (
        <Bezel coreClassName="result">
          <p className="hint">Membaca dengan AI Gateway mock…</p>
        </Bezel>
      )}

      {phase.kind === 'meter' && (
        <MeterResult
          data={phase.data}
          onRetake={reset}
          onSave={(v) => {
            recordDataUpdate('meter', v);
            setPhase({ kind: 'saved', summary: `Meter ${v} kWh tersimpan` });
          }}
        />
      )}
      {phase.kind === 'label' && (
        <LabelResult
          data={phase.data}
          onRetake={reset}
          onSave={(name, w) => {
            addCustomAppliance(name, Number(w));
            recordDataUpdate('label', `${name} ${w}W`);
            setPhase({
              kind: 'saved',
              summary: `${name} (${w} W) telah ditambahkan ke Kios 2D & Rincian Biaya`,
            });
          }}
        />
      )}
      {phase.kind === 'error' && <ErrorCard onRetry={read} onManual={() => onManual()} />}
    </div>
  );
}

function Warnings({ list }: { list: string[] }) {
  if (list.length === 0) return null;
  return (
    <ul className="warnings">
      {list.map((w) => (
        <li key={w}>
          <Icon name="alert" size={14} /> {WARNING_TEXT[w] ?? w}
        </li>
      ))}
    </ul>
  );
}

function ResultHead({ confidence }: { confidence: OcrMeterResponse['confidence'] }) {
  return (
    <div className="row-between">
      <Eyebrow>Hasil baca</Eyebrow>
      <div className="row-gap">
        <ConfidenceBadge level={confidence} short />
        <MockBadge />
      </div>
    </div>
  );
}

function MeterResult({
  data,
  onRetake,
  onSave,
}: {
  data: OcrMeterResponse;
  onRetake: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(String(data.kwh.toFixed(1)));
  const digits = data.kwh.toFixed(1).replace('.', '').split('');

  return (
    <Bezel coreClassName="result">
      <ResultHead confidence={data.confidence} />

      <div className="digits" aria-label={`Terbaca ${data.kwh} kWh`}>
        {digits.map((d, i) => {
          const c = data.digits_confidence[i] ?? 1;
          return (
            <span
              key={i}
              className={`digits__cell ${c < 0.8 ? 'is-unsure' : ''} ${i === digits.length - 1 ? 'is-decimal' : ''}`}
            >
              {d}
            </span>
          );
        })}
        <span className="digits__unit">kWh</span>
      </div>

      {data.needs_retake && (
        <div className="notice notice--soft">
          <Icon name="alert" size={18} />
          <div>
            <strong>Angka belum yakin terbaca.</strong> Periksa digit yang ditandai, atau foto ulang.
          </div>
        </div>
      )}
      <Warnings list={data.warnings} />

      <label className="field">
        <span>Periksa & koreksi angka</span>
        <div className="field__control">
          <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          <em>kWh</em>
        </div>
      </label>

      <div className="capture__actions">
        <IslandButton icon="check" onClick={() => onSave(value)}>
          Simpan
        </IslandButton>
        <IslandButton variant="ghost" icon="retry" onClick={onRetake}>
          Foto ulang
        </IslandButton>
      </div>
    </Bezel>
  );
}

function LabelResult({
  data,
  onRetake,
  onSave,
}: {
  data: OcrLabelResponse;
  onRetake: () => void;
  onSave: (name: string, watt: string) => void;
}) {
  const [name, setName] = useState(data.name);
  const [watt, setWatt] = useState(String(data.power_w));

  return (
    <Bezel coreClassName="result">
      <ResultHead confidence={data.confidence} />
      {data.needs_retake && (
        <div className="notice notice--soft">
          <Icon name="alert" size={18} />
          <div>
            <strong>Label kurang jelas.</strong> Pastikan angka watt sudah benar sebelum disimpan.
          </div>
        </div>
      )}
      <Warnings list={data.warnings} />
      <div className="fields">
        <label className="field">
          <span>Nama alat</span>
          <div className="field__control">
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </label>
        <label className="field">
          <span>Daya pada label</span>
          <div className="field__control">
            <input inputMode="numeric" value={watt} onChange={(e) => setWatt(e.target.value)} />
            <em>W</em>
          </div>
        </label>
      </div>
      {data.brand && <p className="hint">Merek terbaca: {data.brand}</p>}
      <div className="capture__actions">
        <IslandButton icon="check" onClick={() => onSave(name, watt)}>
          Tambah ke Kios 2D
        </IslandButton>
        <IslandButton variant="ghost" icon="retry" onClick={onRetake}>
          Foto ulang
        </IslandButton>
      </div>
    </Bezel>
  );
}

function ErrorCard({ onRetry, onManual }: { onRetry: () => void; onManual: () => void }) {
  const { error } = PROVIDER_ERROR;
  return (
    <Bezel coreClassName="result result--error" as="section">
      <div role="alert">
        <div className="row-between">
          <Eyebrow>Gagal membaca</Eyebrow>
          <code className="mono-dim">{error.code}</code>
        </div>
        <p className="result__msg">{error.message}</p>
        <p className="hint">Request: {error.request_id}</p>
      </div>
      <div className="capture__actions">
        <IslandButton icon="retry" onClick={onRetry}>
          Coba lagi
        </IslandButton>
        <IslandButton variant="ghost" icon="pencil" onClick={onManual}>
          Isi manual
        </IslandButton>
      </div>
    </Bezel>
  );
}

/* ====================================================================== */
/*  Suara                                                                  */
/* ====================================================================== */

type VoicePhase = 'idle' | 'recording' | 'processing' | 'result' | 'error' | 'saved';
const MAX_SECONDS = 60;

function VoiceCapture({ scenario, onManual }: { scenario: CaptureScenario; onManual: () => void }) {
  const { kios, analytics, applyVoiceHours, recordDataUpdate } = useVoltraApp();
  const sttData = analytics.sttExample;
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [hours, setHours] = useState<Record<string, string>>({});
  const streamRef = useRef<MediaStream | null>(null);

  const nameOfSlot = (uid: string) =>
    kios.slots.find((s) => s.uid === uid)?.appliance.name ?? uid;

  useEffect(() => {
    if (phase !== 'recording') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'recording' && seconds >= MAX_SECONDS) void stop();
  }, [seconds, phase]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  async function start() {
    setMicError(null);
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setSeconds(0);
      setPhase('recording');
    } catch {
      setMicError('Izin mikrofon ditolak atau tidak tersedia. Anda bisa klik "Simulasi Suara" atau isi manual.');
    }
  }

  async function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setPhase('processing');
    await wait(1400);
    if (scenario === 'provider_error') return setPhase('error');
    setHours(Object.fromEntries(sttData.entries.map((e) => [e.appliance_id, String(e.hours)])));
    setPhase('result');
  }

  if (phase === 'saved') {
    return (
      <Saved
        summary="Catatan jam pakai berhasil disimpan & diterapkan ke Kios 2D serta Biaya"
        onAgain={() => setPhase('idle')}
      />
    );
  }

  if (phase === 'result') {
    const lowConf = scenario === 'low_confidence';
    return (
      <Bezel coreClassName="result">
        <ResultHead confidence={lowConf ? 'low' : sttData.confidence} />
        <blockquote className="transcript">“{sttData.transcript}”</blockquote>
        <p className="confirm">{sttData.confirm_text}</p>
        {lowConf && (
          <div className="notice notice--soft">
            <Icon name="alert" size={18} />
            <div>
              <strong>Beberapa bagian kurang jelas.</strong> Periksa jam pakai di bawah sebelum menyimpan.
            </div>
          </div>
        )}
        <ul className="entries">
          {sttData.entries.map((e) => (
            <li key={e.appliance_id}>
              <span className="entries__name">
                {nameOfSlot(e.appliance_id)}
                {e.from && e.to && (
                  <small>
                    {e.from}–{e.to}
                  </small>
                )}
              </span>
              <div className="field__control field__control--sm">
                <input
                  inputMode="decimal"
                  aria-label={`Jam pakai ${nameOfSlot(e.appliance_id)}`}
                  value={hours[e.appliance_id] ?? ''}
                  onChange={(ev) => setHours((h) => ({ ...h, [e.appliance_id]: ev.target.value }))}
                />
                <em>jam</em>
              </div>
            </li>
          ))}
          {sttData.work_volume && (
            <li>
              <span className="entries__name">Volume kerja</span>
              <span className="entries__val">
                {sttData.work_volume.value} {sttData.work_volume.unit}
              </span>
            </li>
          )}
        </ul>
        <div className="capture__actions">
          <IslandButton
            icon="check"
            onClick={() => {
              const numericMap = Object.fromEntries(
                Object.entries(hours).map(([k, v]) => [k, Number(v.replace(',', '.'))]),
              );
              applyVoiceHours(numericMap, sttData.work_volume?.value);
              recordDataUpdate('voice');
              setPhase('saved');
            }}
          >
            Sudah benar, simpan
          </IslandButton>
          <IslandButton variant="ghost" icon="mic" onClick={() => setPhase('idle')}>
            Rekam ulang
          </IslandButton>
        </div>
      </Bezel>
    );
  }

  if (phase === 'error') {
    return <ErrorCard onRetry={() => setPhase('idle')} onManual={onManual} />;
  }

  const recording = phase === 'recording';
  const processing = phase === 'processing';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <Bezel coreClassName="voice">
      <p className="voice__prompt">
        {processing
          ? 'Mengubah suara jadi catatan…'
          : recording
            ? 'Silakan bicara…'
            : 'Ceritakan pemakaian alat hari ini'}
      </p>
      <p className="voice__example">{analytics.voicePromptExample}</p>

      <div className={`wave ${recording ? 'is-live' : ''} ${processing ? 'is-busy' : ''}`} aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 7) * 90}ms` }} />
        ))}
      </div>

      <p className="voice__timer">
        {mm}:{ss} <span>/ 01:00</span>
      </p>

      <button
        type="button"
        className={`rec ${recording ? 'is-live' : ''}`}
        onClick={recording ? stop : start}
        disabled={processing}
        aria-label={recording ? 'Berhenti merekam' : 'Mulai merekam'}
      >
        <span className="rec__ring" />
        <span className="rec__core">
          <Icon name={recording ? 'stop' : 'mic'} size={26} />
        </span>
      </button>

      {micError && (
        <div className="notice notice--soft" role="alert">
          <Icon name="alert" size={18} />
          <div>{micError}</div>
        </div>
      )}

      <div className="row-gap">
        <button type="button" className="textlink" onClick={stop} disabled={processing}>
          Simulasi Suara Langsung
        </button>
        <span>·</span>
        <button type="button" className="textlink" onClick={onManual}>
          Isi manual
        </button>
      </div>
    </Bezel>
  );
}

/* ====================================================================== */
/*  Manual                                                                 */
/* ====================================================================== */

function ManualForm({ prefill }: { prefill: string }) {
  const { profile, recordDataUpdate } = useVoltraApp();
  const [kind, setKind] = useState<'meter' | 'token'>(
    profile.billingType === 'prepaid' ? 'token' : 'meter',
  );
  const [time, setTime] = useState<'pagi' | 'malam'>('malam');
  const [value, setValue] = useState(prefill);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <Saved
        summary={kind === 'meter' ? `Meter ${time} ${value} kWh tersimpan` : `Token Rp ${value} tersimpan`}
        onAgain={() => {
          setSaved(false);
          setValue('');
          setNote('');
        }}
      />
    );
  }

  const valid = value.trim() !== '' && !Number.isNaN(Number(value.replace(',', '.')));

  return (
    <Bezel coreClassName="result" as="form">
      <Eyebrow>Isi manual · {profile.businessName}</Eyebrow>

      <div className="pillset" role="radiogroup" aria-label="Jenis data">
        {(['meter', 'token'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            className={kind === k ? 'is-active' : ''}
            onClick={() => setKind(k)}
          >
            {k === 'meter' ? 'Angka meter' : 'Beli token'}
          </button>
        ))}
      </div>

      {kind === 'meter' && (
        <div className="pillset" role="radiogroup" aria-label="Waktu foto">
          {(['pagi', 'malam'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={time === t}
              className={time === t ? 'is-active' : ''}
              onClick={() => setTime(t)}
            >
              {t === 'pagi' ? 'Buka (pagi)' : 'Tutup (malam)'}
            </button>
          ))}
        </div>
      )}

      <label className="field">
        <span>{kind === 'meter' ? 'Angka di meter' : 'Nominal token'}</span>
        <div className="field__control">
          <input
            inputMode="decimal"
            placeholder={kind === 'meter' ? '12345,6' : '100000'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <em>{kind === 'meter' ? 'kWh' : 'Rp'}</em>
        </div>
      </label>

      <label className="field">
        <span>Catatan ({profile.unitLabel}, opsional)</span>
        <div className="field__control">
          <textarea
            rows={3}
            placeholder={`Mis. target hari ini ${profile.dailyVolume} ${profile.unitLabel}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </label>

      <div className="capture__actions">
        <IslandButton
          icon="check"
          disabled={!valid}
          onClick={() => {
            recordDataUpdate('manual', value);
            setSaved(true);
          }}
        >
          Simpan
        </IslandButton>
      </div>
    </Bezel>
  );
}

/* ====================================================================== */

function Saved({ summary, onAgain }: { summary: string; onAgain: () => void }) {
  return (
    <Bezel tone="moss" coreClassName="saved">
      <span className="saved__check">
        <Icon name="check" size={26} />
      </span>
      <h2 className="saved__title">
        Tersimpan, <em>terima kasih</em>
      </h2>
      <p className="saved__text">{summary}.</p>
      <div className="capture__actions">
        <Link href="/biaya" className="island island--solid">
          <span>Lihat biaya</span>
          <span className="island__icon">
            <Icon name="arrow" size={16} />
          </span>
        </Link>
        <Link href="/kios" className="island island--ghost">
          <span>Kios 2D</span>
          <span className="island__icon">
            <Icon name="store" size={16} />
          </span>
        </Link>
        <IslandButton variant="ghost" icon="retry" onClick={onAgain}>
          Catat lagi
        </IslandButton>
      </div>
    </Bezel>
  );
}
