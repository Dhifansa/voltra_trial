'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import { Icon, type IconName } from '../ui/icon';

const TABS: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Beranda', icon: 'home' },
  { href: '/kios', label: 'Kios', icon: 'store' },
  { href: '/catat', label: 'Catat', icon: 'capture' },
  { href: '/biaya', label: 'Biaya', icon: 'chart' },
  { href: '/profil', label: 'Profil', icon: 'user' },
];

const MENU: Array<{ href: string; label: string; note: string; soon?: boolean }> = [
  { href: '/masuk', label: 'Masuk & Profiling', note: 'Login, pilih usaha, lalu buka Kios 2D' },
  { href: '/', label: 'Beranda', note: 'Ringkasan listrik hari ini' },
  { href: '/kios', label: 'Kios Virtual 2D', note: 'Simulasi alat sesuai template usaha' },
  { href: '/catat', label: 'Catat data', note: 'Foto meter, label alat, suara' },
  { href: '/biaya', label: 'Keuangan & Biaya', note: 'Ke mana uang listrik pergi' },
  { href: '/profil', label: 'Profil Usaha', note: 'Kelola akun, tarif PLN, & jenis usaha' },
  { href: '/pengaturan', label: 'Pengaturan', note: 'Pengingat WA, privasi, & reset data' },
  { href: '#', label: 'Tanya Wati', note: 'Asisten listrik usaha', soon: true },
  { href: '/dev', label: 'Uji AI Gateway', note: 'Halaman pengembang' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { profile, user, settings } = useVoltraApp();
  const template = getTemplate(profile.templateId);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={`shell ${settings.reducedMotion ? 'is-reduced-motion' : ''}`}>
      <header className="topbar">
        <div className="topbar__island">
          <Link href="/" className="brand" aria-label="Beranda">
            <Image
              src="/Logo.png"
              alt=""
              width={24}
              height={31}
              className="brand__logo"
              priority
            />
            <Image
              src="/Voltes.png"
              alt="Voltess"
              width={78}
              height={19}
              className="brand__wordmark"
              priority
            />
          </Link>
          <Link href="/profil" className="topbar__trial" title="Status akun & usaha">
            {user.role === 'user' ? 'Akun Aktif' : 'Tamu'} · {template.display_name.split(' ')[0]}
          </Link>
          <button
            type="button"
            className={`burger ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open ? 'true' : 'false'}
            aria-controls="menu-overlay"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        id="menu-overlay"
        className={`overlay ${open ? 'is-open' : ''}`}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <nav className="overlay__nav" aria-label="Menu utama">
          <p className="overlay__biz">
            {profile.businessName} <span>· {template.display_name} ({profile.tariffName})</span>
          </p>
          <ul>
            {MENU.map((item) => (
              <li key={item.label}>
                {item.soon ? (
                  <span className="overlay__link is-soon">
                    <span className="overlay__label">{item.label}</span>
                    <span className="overlay__note">{item.note} · segera</span>
                  </span>
                ) : (
                  <Link href={item.href} className="overlay__link" tabIndex={open ? 0 : -1}>
                    <span className="overlay__label">{item.label}</span>
                    <span className="overlay__note">{item.note}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="shell__content">{children}</div>

      <nav className="dock" aria-label="Navigasi bawah">
        <div className="dock__island">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`dock__tab ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon name={tab.icon} size={18} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
