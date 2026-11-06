'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { MOCK_BUSINESS } from '@/lib/mock-data';
import { Icon, type IconName } from '../ui/icon';

const TABS: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Beranda', icon: 'home' },
  { href: '/catat', label: 'Catat', icon: 'capture' },
  { href: '/biaya', label: 'Biaya', icon: 'chart' },
];

const MENU: Array<{ href: string; label: string; note: string; soon?: boolean }> = [
  { href: '/', label: 'Beranda', note: 'Ringkasan hari ini' },
  { href: '/catat', label: 'Catat data', note: 'Foto meter, label alat, suara' },
  { href: '/biaya', label: 'Rincian biaya', note: 'Ke mana uang listrik pergi' },
  { href: '#', label: 'Kios Virtual', note: 'Simulasi gratis', soon: true },
  { href: '#', label: 'Tanya Wati', note: 'Asisten listrik usaha', soon: true },
  { href: '/dev', label: 'Uji AI Gateway', note: 'Halaman pengembang' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__island">
          <Link href="/" className="brand" aria-label="Voltra beranda">
            <Image
              src="/logo.png"
              alt="Logo Voltra"
              width={30}
              height={30}
              className="brand__logo"
              priority
            />
            Voltra
          </Link>
          <span className="topbar__trial">Trial · {MOCK_BUSINESS.trial_days_left} hari</span>
          <button
            type="button"
            className={`burger ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
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
        aria-hidden={!open}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <nav className="overlay__nav" aria-label="Menu utama">
          <p className="overlay__biz">
            {MOCK_BUSINESS.name} <span>· {MOCK_BUSINESS.template}</span>
          </p>
          <ul>
            {MENU.map((item, i) => (
              <li key={item.label} style={{ transitionDelay: open ? `${90 + i * 45}ms` : '0ms' }}>
                {item.soon ? (
                  <span className="overlay__link is-soon" aria-disabled="true">
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
