/**
 * Ilustrasi alat (SVG datar, ringan — ADR-004). Tidak ada angka di sini.
 */
import type { ReactNode } from 'react';
const NAVY = '#1a2945';
const BODY = '#ffffff';
const LINE = '#cbd5e1';
const BLUE = '#2d4673';
const SKY = '#dbe4f0';
const GREEN = '#0f766e';
const MINT = '#cbd5e1';
const STEEL = '#e2e8f0';

function Shell({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 72" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="32" cy="69" rx="24" ry="2.5" fill="rgba(15,23,42,0.08)" />
      {children}
    </svg>
  );
}

const art: Record<string, (on: boolean) => ReactNode> = {
  washer: (on) => (
    <>
      <rect x="10" y="10" width="44" height="56" rx="6" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <rect x="10" y="10" width="44" height="11" rx="6" fill={STEEL} />
      <circle cx="18" cy="15.5" r="2" fill={on ? GREEN : LINE} />
      <rect x="36" y="14" width="13" height="3" rx="1.5" fill={LINE} />
      <circle cx="32" cy="43" r="15" fill={STEEL} stroke={NAVY} strokeWidth="2.5" />
      <circle cx="32" cy="43" r="10" fill={on ? SKY : '#f1f5f9'} />
      {on && <path className="art-spin" d="M25 44c3-4 7 2 10-2s5 1 5 1" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" />}
    </>
  ),
  dryer: (on) => (
    <>
      <rect x="10" y="10" width="44" height="56" rx="6" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <rect x="10" y="10" width="44" height="11" rx="6" fill={STEEL} />
      <circle cx="18" cy="15.5" r="2" fill={on ? '#f97316' : LINE} />
      <circle cx="32" cy="43" r="15" fill={STEEL} stroke={NAVY} strokeWidth="2.5" />
      <circle cx="32" cy="43" r="10" fill={on ? '#fed7aa' : '#f1f5f9'} />
      {on && (
        <g className="art-heat" stroke="#f97316" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M27 47c0-3 2-3 2-6M32 48c0-3 2-3 2-6M37 47c0-3 2-3 2-6" />
        </g>
      )}
    </>
  ),
  iron: (on) => (
    <>
      <rect x="6" y="54" width="52" height="5" rx="2.5" fill={STEEL} />
      <path d="M12 52c0-14 10-22 28-22h10c3 0 5 2 5 5v17H12Z" fill={NAVY} />
      <path d="M22 30c2-7 8-10 16-10h6v10" stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="14" y="48" width="40" height="4" rx="2" fill={STEEL} />
      <circle cx="44" cy="40" r="2.5" fill={on ? '#f97316' : LINE} />
      {on && (
        <g className="art-heat" stroke={LINE} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M20 26c0-4 3-4 3-8M28 22c0-4 3-4 3-8" />
        </g>
      )}
    </>
  ),
  pump: (on) => (
    <>
      <rect x="8" y="52" width="48" height="8" rx="3" fill={STEEL} />
      <rect x="14" y="30" width="28" height="22" rx="5" fill={BLUE} />
      <rect x="18" y="34" width="20" height="3" rx="1.5" fill={SKY} />
      <rect x="18" y="40" width="20" height="3" rx="1.5" fill={SKY} />
      <path d="M42 38h8v-14h6" stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" />
      {on && <circle className="art-drop" cx="56" cy="30" r="2.5" fill={BLUE} />}
    </>
  ),
  lamp: (on) => (
    <>
      <path d="M32 4v14" stroke={NAVY} strokeWidth="2" />
      <path d="M18 30c0-8 6-12 14-12s14 4 14 12H18Z" fill={NAVY} />
      <circle cx="32" cy="34" r="6" fill={on ? '#fde68a' : STEEL} />
      {on && <path className="art-glow" d="M14 40 4 66h56L50 40Z" fill="#fde68a" opacity="0.35" />}
    </>
  ),
  fridge: (on) => (
    <>
      <rect x="14" y="6" width="36" height="60" rx="6" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <path d="M14 28h36" stroke={LINE} strokeWidth="1.5" />
      <rect x="18" y="14" width="3" height="9" rx="1.5" fill={NAVY} />
      <rect x="18" y="33" width="3" height="14" rx="1.5" fill={NAVY} />
      <circle cx="44" cy="12" r="2" fill={on ? GREEN : LINE} />
      {on && <path className="art-cold" d="M38 46l4 4m0-4-4 4M40 44v8" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" />}
    </>
  ),
  freezer: (on) => (
    <>
      <rect x="6" y="28" width="52" height="38" rx="6" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <rect x="6" y="24" width="52" height="9" rx="4" fill={NAVY} />
      <rect x="26" y="38" width="12" height="3" rx="1.5" fill={LINE} />
      <circle cx="50" cy="44" r="2" fill={on ? GREEN : LINE} />
      {on && <path className="art-cold" d="M16 50l6 6m0-6-6 6M19 48v10" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" />}
    </>
  ),
  ricecooker: (on) => (
    <>
      <path d="M12 38h40v20a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8V38Z" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <path d="M10 38c0-10 10-16 22-16s22 6 22 16H10Z" fill={MINT} />
      <rect x="28" y="16" width="8" height="6" rx="3" fill={NAVY} />
      <rect x="24" y="48" width="16" height="7" rx="3" fill={STEEL} />
      <circle cx="28" cy="51.5" r="1.6" fill={on ? '#f97316' : LINE} />
      {on && (
        <g className="art-heat" stroke={LINE} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M26 12c0-3 2-3 2-6M36 12c0-3 2-3 2-6" />
        </g>
      )}
    </>
  ),
  blender: (on) => (
    <>
      <path d="M20 12h24l-4 34H24Z" fill={on ? SKY : '#f1f5f9'} stroke={LINE} strokeWidth="1.5" />
      <rect x="18" y="8" width="28" height="6" rx="3" fill={NAVY} />
      <path d="M18 46h28l2 20H16Z" fill={NAVY} />
      <circle cx="32" cy="56" r="3" fill={on ? GREEN : LINE} />
      {on && <path className="art-spin" d="M26 36c4-3 8 3 12 0" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" />}
    </>
  ),
  fan: (on) => (
    <>
      <path d="M32 40v22" stroke={NAVY} strokeWidth="3" />
      <rect x="18" y="60" width="28" height="5" rx="2.5" fill={NAVY} />
      <circle cx="32" cy="26" r="20" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <g className={on ? 'art-rotor' : ''} style={{ transformOrigin: '32px 26px' }}>
        <path d="M32 26c-2-8 0-14 6-14 3 6-1 11-6 14Zm0 0c8-2 14 0 14 6-6 3-11-1-14-6Zm0 0c-6 6-12 7-15 2 3-6 9-5 15-2Z" fill={BLUE} />
      </g>
      <circle cx="32" cy="26" r="3" fill={NAVY} />
    </>
  ),
  oven: (on) => (
    <>
      <rect x="8" y="14" width="48" height="50" rx="6" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <rect x="8" y="14" width="48" height="10" rx="5" fill={NAVY} />
      <circle cx="16" cy="19" r="2" fill={STEEL} />
      <circle cx="24" cy="19" r="2" fill={STEEL} />
      <circle cx="48" cy="19" r="2" fill={on ? '#f97316' : '#475569'} />
      <rect x="14" y="30" width="36" height="26" rx="4" fill={on ? '#fed7aa' : STEEL} />
      <rect x="22" y="27" width="20" height="3" rx="1.5" fill={LINE} />
      {on && <path className="art-glow" d="M18 50h28" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />}
    </>
  ),
  mixer: (on) => (
    <>
      <path d="M14 18c0-6 4-10 10-10h20c4 0 6 3 6 6v8H14Z" fill={GREEN} />
      <rect x="40" y="22" width="10" height="34" rx="4" fill={GREEN} />
      <path d="M18 40h22l-3 16H21Z" fill={STEEL} stroke={LINE} strokeWidth="1.5" />
      <path d="M28 22v16" stroke={NAVY} strokeWidth="2.5" />
      <rect x="10" y="56" width="44" height="8" rx="3" fill={NAVY} />
      {on && <path className="art-spin" d="M23 46c3-2 6 2 10 0" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" />}
    </>
  ),
  display: (on) => (
    <>
      <rect x="6" y="18" width="52" height="46" rx="6" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <rect x="10" y="22" width="44" height="26" rx="3" fill={on ? SKY : '#f1f5f9'} />
      <path d="M10 35h44" stroke={BODY} strokeWidth="1.5" />
      <circle cx="18" cy="30" r="3" fill="#fbbf24" />
      <circle cx="28" cy="30" r="3" fill="#f472b6" />
      <circle cx="22" cy="42" r="3" fill="#fbbf24" />
      <rect x="10" y="52" width="44" height="8" rx="3" fill={NAVY} />
      {on && <circle cx="50" cy="56" r="1.8" fill={GREEN} />}
    </>
  ),
  generic: (on) => (
    <>
      <rect x="12" y="16" width="40" height="48" rx="8" fill={BODY} stroke={LINE} strokeWidth="1.5" />
      <path d="M34 26 24 42h8l-2 12 10-16h-8l2-12Z" fill={on ? BLUE : LINE} />
    </>
  ),
};

export function ApplianceArt({ icon, on }: { icon: string; on: boolean }) {
  const draw = art[icon] ?? art.generic!;
  return <Shell>{draw(on)}</Shell>;
}
