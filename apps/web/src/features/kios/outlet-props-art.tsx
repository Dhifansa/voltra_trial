export interface InteractivePropDef {
  id: string;
  name: string;
  zone: string;
  x: number;
  y: number;
  tip: string;
  badge: string;
}

export const TEMPLATE_PROPS: Record<string, InteractivePropDef[]> = {
  laundry: [
    {
      id: 'basket',
      name: 'Keranjang Cucian',
      zone: 'Area Sortir',
      x: 54,
      y: 62,
      badge: '🧺 Muatan 7 Kg',
      tip: 'Tunggu cucian terkumpul penuh 1 tabung baru nyalakan Mesin Cuci supaya listrik per kg jauh lebih hemat!',
    },
    {
      id: 'laundry-counter',
      name: 'Meja Kasir & Timbangan',
      zone: 'Kasir Depan',
      x: 80,
      y: 74,
      badge: '⚖️ 50 kg/hari',
      tip: 'Setrika sekaligus saat lempengan panas! Menyalakan-matikan setrika berulang kali justru boros daya awal.',
    },
  ],
  warung: [
    {
      id: 'diningtable',
      name: 'Meja Makan Pelanggan',
      zone: 'Area Pelanggan',
      x: 44,
      y: 62,
      badge: '🍜 Meja #1',
      tip: 'Nyalakan Kipas Angin saat ada pelanggan di meja makan, dan matikan saat jam sepi sore hari.',
    },
    {
      id: 'warung-counter',
      name: 'Kasir & Kaleng Kerupuk',
      zone: 'Kasir Warung',
      x: 82,
      y: 74,
      badge: '🧾 Kasir & Teh',
      tip: 'Cabut mode penghangat (Warm) Penanak Nasi jika nasi tinggal sedikit atau warung sudah mau tutup.',
    },
  ],
  roti: [
    {
      id: 'breadrack',
      name: 'Rak Roti Hangat',
      zone: 'Dinding Bakery',
      x: 33,
      y: 21,
      badge: '🥐 Fresh Baked',
      tip: 'Panggang beberapa loyang berurutan saat Oven sudah panas—pemanasan awal Oven memakan listrik terbesar!',
    },
    {
      id: 'bakery-counter',
      name: 'Kasir & Kotak Kue',
      zone: 'Kasir Bakery',
      x: 80,
      y: 74,
      badge: '🎂 Kemas Roti',
      tip: 'Bersihkan karet pintu Chiller secara rutin agar udara dingin tidak bocor keluar di ruang panggang.',
    },
  ],
  kustom: [
    {
      id: 'plant',
      name: 'Tanaman Hias Kios',
      zone: 'Sudut Segar',
      x: 14,
      y: 59,
      badge: '🌿 Udara Sejuk',
      tip: 'Sirkulasi udara dan ventilasi alami yang baik membuat ruangan sejuk tanpa harus menyalakan pendingin terus.',
    },
    {
      id: 'kustom-counter',
      name: 'Meja Kasir Utama',
      zone: 'Kasir Depan',
      x: 80,
      y: 74,
      badge: '💻 Kasir Toko',
      tip: 'Matikan saklar terminal listrik peralatan yang tidak dipakai sebelum menutup kios malam hari.',
    },
  ],
};

export function OutletPropArt({ id, active }: { id: string; active?: boolean }) {
  switch (id) {
    case 'detergent':
      return (
        <svg viewBox="0 0 64 52" fill="none" aria-hidden="true">
          {/* Rak dinding */}
          <rect x="6" y="38" width="52" height="5" rx="2.5" fill="#1A2945" />
          <path d="M14 43L10 49M50 43L54 49" stroke="#1A2945" strokeWidth="2.5" strokeLinecap="round" />
          {/* Botol deterjen biru */}
          <rect x="12" y="14" width="16" height="24" rx="4" fill="#38BDF8" stroke="#1A2945" strokeWidth="2" />
          <rect x="16" y="9" width="8" height="5" rx="1.5" fill="#FBBF24" stroke="#1A2945" strokeWidth="1.8" />
          <rect x="15" y="22" width="10" height="8" rx="2" fill="#FFFFFF" />
          {/* Botol pewangi pink/teal */}
          <rect x="33" y="18" width="14" height="20" rx="4" fill="#2DD4BF" stroke="#1A2945" strokeWidth="2" />
          <rect x="37" y="13" width="6" height="5" rx="1.5" fill="#1A2945" />
          {/* Gelembung sabun */}
          <circle cx="52" cy="14" r="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" className={active ? 'art-drop' : 'art-glow'} />
          <circle cx="46" cy="8" r="2.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
        </svg>
      );

    case 'rack':
      return (
        <svg viewBox="0 0 72 56" fill="none" aria-hidden="true">
          {/* Tiang jemuran gantung */}
          <line x1="8" y1="10" x2="64" y2="10" stroke="#1A2945" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="2" x2="16" y2="10" stroke="#64748B" strokeWidth="2" />
          <line x1="56" y1="2" x2="56" y2="10" stroke="#64748B" strokeWidth="2" />
          {/* Baju gantung 1 */}
          <g className={active ? 'art-spin' : ''}>
            <path d="M24 10L18 16H30L24 10Z" stroke="#1A2945" strokeWidth="1.8" fill="none" />
            <path d="M15 16H33L35 26H30V44H18V26H13L15 16Z" fill="#38BDF8" stroke="#1A2945" strokeWidth="2" strokeLinejoin="round" />
          </g>
          {/* Handuk/Baju gantung 2 */}
          <g className={active ? 'art-spin' : ''}>
            <path d="M48 10L42 16H54L48 10Z" stroke="#1A2945" strokeWidth="1.8" fill="none" />
            <rect x="40" y="16" width="16" height="26" rx="3" fill="#FBBF24" stroke="#1A2945" strokeWidth="2" />
            <line x1="40" y1="36" x2="56" y2="36" stroke="#1A2945" strokeWidth="1.8" />
          </g>
        </svg>
      );

    case 'basket':
      return (
        <svg viewBox="0 0 64 56" fill="none" aria-hidden="true">
          {/* Tumpukan pakaian di atas keranjang */}
          <path d="M16 24C16 16 26 14 32 18C38 13 48 16 48 24" fill="#38BDF8" stroke="#1A2945" strokeWidth="2" />
          <path d="M22 20C25 12 39 12 42 20" fill="#FBBF24" stroke="#1A2945" strokeWidth="2" />
          {/* Keranjang laundry */}
          <path d="M10 24H54L48 48H16L10 24Z" fill="#FFFFFF" stroke="#1A2945" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="8" y="21" width="48" height="5" rx="2.5" fill="#2DD4BF" stroke="#1A2945" strokeWidth="2" />
          {/* Lubang ventilasi keranjang */}
          <line x1="22" y1="31" x2="24" y2="42" stroke="#1A2945" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="31" x2="32" y2="42" stroke="#1A2945" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="31" x2="40" y2="42" stroke="#1A2945" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'menuboard':
      return (
        <svg viewBox="0 0 68 50" fill="none" aria-hidden="true">
          <rect x="6" y="6" width="56" height="38" rx="5" fill="#1A2945" stroke="#FBBF24" strokeWidth="2.5" />
          <rect x="14" y="12" width="24" height="4" rx="2" fill="#FBBF24" />
          <line x1="14" y1="22" x2="42" y2="22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="29" x2="38" y2="29" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="36" x2="46" y2="36" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="52" cy="24" r="5" fill="#F97316" />
        </svg>
      );

    case 'diningtable':
      return (
        <svg viewBox="0 0 68 56" fill="none" aria-hidden="true">
          {/* Kursi kiri & kanan */}
          <rect x="4" y="30" width="12" height="6" rx="2" fill="#38BDF8" stroke="#1A2945" strokeWidth="1.8" />
          <path d="M6 36V48M14 36V48" stroke="#1A2945" strokeWidth="2" strokeLinecap="round" />
          <rect x="52" y="30" width="12" height="6" rx="2" fill="#38BDF8" stroke="#1A2945" strokeWidth="1.8" />
          <path d="M54 36V48M62 36V48" stroke="#1A2945" strokeWidth="2" strokeLinecap="round" />
          {/* Meja warung */}
          <rect x="14" y="22" width="40" height="6" rx="2.5" fill="#FBBF24" stroke="#1A2945" strokeWidth="2" />
          <path d="M20 28V48M48 28V48" stroke="#1A2945" strokeWidth="2.4" strokeLinecap="round" />
          {/* Mangkok & botol kecap/sambal */}
          <path d="M22 22C22 17 32 17 32 22Z" fill="#FFFFFF" stroke="#1A2945" strokeWidth="1.8" />
          <rect x="38" y="13" width="5" height="9" rx="1.5" fill="#EF4444" stroke="#1A2945" strokeWidth="1.5" />
          <rect x="44" y="15" width="4" height="7" rx="1" fill="#1A2945" />
        </svg>
      );

    case 'wartegcase':
      return (
        <svg viewBox="0 0 72 56" fill="none" aria-hidden="true">
          {/* Etalase kaca lauk */}
          <rect x="8" y="10" width="56" height="38" rx="4" fill="#E0F2FE" stroke="#1A2945" strokeWidth="2.2" />
          <line x1="8" y1="28" x2="64" y2="28" stroke="#1A2945" strokeWidth="2" />
          <rect x="8" y="38" width="56" height="10" fill="#2DD4BF" stroke="#1A2945" strokeWidth="2" />
          {/* Nampan lauk-pauk */}
          <ellipse cx="22" cy="24" rx="7" ry="3.5" fill="#F97316" stroke="#1A2945" strokeWidth="1.6" />
          <ellipse cx="36" cy="24" rx="7" ry="3.5" fill="#22C55E" stroke="#1A2945" strokeWidth="1.6" />
          <ellipse cx="50" cy="24" rx="7" ry="3.5" fill="#FBBF24" stroke="#1A2945" strokeWidth="1.6" />
          {/* Kilau kaca */}
          <line x1="16" y1="14" x2="12" y2="20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'breadrack':
      return (
        <svg viewBox="0 0 68 52" fill="none" aria-hidden="true">
          {/* Rak kayu bakery */}
          <rect x="8" y="22" width="52" height="4" rx="2" fill="#D97706" stroke="#1A2945" strokeWidth="1.8" />
          <rect x="8" y="40" width="52" height="4" rx="2" fill="#D97706" stroke="#1A2945" strokeWidth="1.8" />
          {/* Roti & Croissant */}
          <path d="M14 22C14 14 28 14 28 22Z" fill="#F59E0B" stroke="#1A2945" strokeWidth="1.8" />
          <path d="M36 22C36 15 52 15 52 22Z" fill="#FBBF24" stroke="#1A2945" strokeWidth="1.8" />
          <path d="M16 40C16 32 32 32 32 40Z" fill="#FBBF24" stroke="#1A2945" strokeWidth="1.8" />
          <path d="M38 40C38 33 52 33 52 40Z" fill="#F59E0B" stroke="#1A2945" strokeWidth="1.8" />
          {/* Uap hangat */}
          <path d="M22 10C22 7 25 7 25 4" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" className="art-heat" />
          <path d="M44 10C44 7 47 7 47 4" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" className="art-heat" />
        </svg>
      );

    case 'pastrytable':
      return (
        <svg viewBox="0 0 68 56" fill="none" aria-hidden="true">
          {/* Meja kayu ulen */}
          <rect x="8" y="24" width="52" height="7" rx="2.5" fill="#FDE68A" stroke="#1A2945" strokeWidth="2" />
          <path d="M14 31V48M54 31V48" stroke="#1A2945" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="42" x2="54" y2="42" stroke="#1A2945" strokeWidth="2" />
          {/* Adonan & gilingan kayu */}
          <path d="M18 24C18 16 34 16 34 24Z" fill="#FEF3C7" stroke="#1A2945" strokeWidth="1.8" />
          <rect x="38" y="19" width="16" height="5" rx="2.5" fill="#D97706" stroke="#1A2945" strokeWidth="1.6" />
        </svg>
      );

    case 'floursack':
      return (
        <svg viewBox="0 0 64 56" fill="none" aria-hidden="true">
          {/* Karung tepung */}
          <path d="M14 20C14 15 20 14 24 12H36C40 14 46 15 46 20L48 46C48 48 45 50 42 50H18C15 50 12 48 12 46L14 20Z" fill="#FFFFFF" stroke="#1A2945" strokeWidth="2.2" />
          <path d="M22 12L20 7H40L38 12" fill="#FEF3C7" stroke="#1A2945" strokeWidth="1.8" />
          <rect x="19" y="24" width="22" height="12" rx="3" fill="#FBBF24" stroke="#1A2945" strokeWidth="1.6" />
          {/* Blok mentega di samping */}
          <rect x="38" y="36" width="16" height="12" rx="2.5" fill="#FDE047" stroke="#1A2945" strokeWidth="2" />
        </svg>
      );

    case 'targetboard':
      return (
        <svg viewBox="0 0 68 50" fill="none" aria-hidden="true">
          <rect x="8" y="6" width="52" height="38" rx="5" fill="#FFFFFF" stroke="#1A2945" strokeWidth="2.2" />
          <circle cx="26" cy="25" r="10" fill="#E0F2FE" stroke="#1A2945" strokeWidth="2" />
          <circle cx="26" cy="25" r="5" fill="#2DD4BF" stroke="#1A2945" strokeWidth="1.6" />
          <path d="M42 18H52M42 25H54M42 32H49" stroke="#1A2945" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'plant':
      return (
        <svg viewBox="0 0 60 56" fill="none" aria-hidden="true">
          <g className={active ? 'art-spin' : ''}>
            <path d="M30 32C30 18 16 14 14 22C12 28 24 32 30 32Z" fill="#2DD4BF" stroke="#1A2945" strokeWidth="2" />
            <path d="M30 30C30 14 44 12 46 20C48 26 36 30 30 30Z" fill="#10B981" stroke="#1A2945" strokeWidth="2" />
            <path d="M30 32C26 16 30 8 34 10C38 12 34 24 30 32Z" fill="#34D399" stroke="#1A2945" strokeWidth="2" />
          </g>
          <path d="M20 32H40L37 48H23L20 32Z" fill="#F97316" stroke="#1A2945" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="18" y="29" width="24" height="5" rx="2" fill="#FB923C" stroke="#1A2945" strokeWidth="2" />
        </svg>
      );

    case 'stockrack':
      return (
        <svg viewBox="0 0 64 56" fill="none" aria-hidden="true">
          <path d="M12 8V48M52 8V48M12 26H52M12 44H52" stroke="#1A2945" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="16" y="12" width="14" height="12" rx="2" fill="#FBBF24" stroke="#1A2945" strokeWidth="1.8" />
          <rect x="34" y="14" width="12" height="10" rx="2" fill="#38BDF8" stroke="#1A2945" strokeWidth="1.8" />
          <rect x="18" y="30" width="28" height="12" rx="2" fill="#E2E8F0" stroke="#1A2945" strokeWidth="1.8" />
        </svg>
      );

    default:
      // Counter / Meja Kasir Kios
      return (
        <svg viewBox="0 0 76 58" fill="none" aria-hidden="true">
          {/* Badan meja kasir */}
          <rect x="6" y="24" width="64" height="26" rx="4" fill="#FFFFFF" stroke="#1A2945" strokeWidth="2.2" />
          <rect x="4" y="20" width="68" height="6" rx="3" fill="#1A2945" />
          <rect x="12" y="31" width="52" height="13" rx="2.5" fill="#E0F2FE" stroke="#1A2945" strokeWidth="1.6" />
          {/* Mesin kasir / timbangan di atas meja */}
          <rect x="16" y="8" width="22" height="12" rx="2.5" fill="#2DD4BF" stroke="#1A2945" strokeWidth="2" />
          <rect x="20" y="11" width="14" height="5" rx="1" fill="#FFFFFF" />
          {/* Tumpukan nota / kotak / toples di sebelah kanan kasir */}
          <rect x="44" y="11" width="16" height="9" rx="2" fill="#FBBF24" stroke="#1A2945" strokeWidth="1.8" />
        </svg>
      );
  }
}

export function ShopCatArt({ awake }: { awake: boolean }) {
  return (
    <svg viewBox="0 0 54 38" fill="none" aria-hidden="true">
      {/* Keset pintu */}
      <ellipse cx="27" cy="29" rx="23" ry="7" fill="#1A2945" />
      <ellipse cx="27" cy="28" rx="19" ry="5" fill="#2DD4BF" />
      {/* Badan kucing oranye */}
      <ellipse cx="25" cy="22" rx="11" ry="7.5" fill="#FB923C" stroke="#1A2945" strokeWidth="2" />
      {/* Kepala kucing */}
      <circle cx="34" cy="18" r="6.5" fill="#FB923C" stroke="#1A2945" strokeWidth="2" />
      {/* Telinga */}
      <path d="M29 13L30 7L34 11Z" fill="#FB923C" stroke="#1A2945" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M35 11L39 7L40 13Z" fill="#FB923C" stroke="#1A2945" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Wajah */}
      {awake ? (
        <>
          <circle cx="32.5" cy="17.5" r="1.2" fill="#1A2945" />
          <circle cx="36.5" cy="17.5" r="1.2" fill="#1A2945" />
        </>
      ) : (
        <>
          <path d="M31 18C32 19 33 19 34 18" stroke="#1A2945" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M35 18C36 19 37 19 38 18" stroke="#1A2945" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {/* Ekor goyang */}
      <path
        d="M14 22C9 20 8 14 12 12"
        stroke="#FB923C"
        strokeWidth="3.5"
        strokeLinecap="round"
        className={awake ? 'art-spin' : ''}
      />
    </svg>
  );
}

