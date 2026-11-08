'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useVoltraApp } from '@/context/app-context';
import { getTemplate } from '@/features/kios/templates';
import { getDictionary } from '@/lib/i18n';
import { Icon, type IconName } from '../ui/icon';

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { profile, user, settings } = useVoltraApp();
  const template = getTemplate(profile.templateId);
  const t = getDictionary(settings.language || 'id');

  const tabs: Array<{ href: string; label: string; icon: IconName }> = [
    { href: '/', label: t.nav.home, icon: 'home' },
    { href: '/kios', label: t.nav.kiosk, icon: 'store' },
    { href: '/catat', label: t.nav.record, icon: 'capture' },
    { href: '/biaya', label: t.nav.cost, icon: 'chart' },
    { href: '/profil', label: t.nav.profile, icon: 'user' },
  ];

  const menuItems: Array<{ href: string; label: string; note: string; soon?: boolean }> = [
    { href: '/masuk', label: t.menu.login, note: t.menu.loginNote },
    { href: '/', label: t.menu.home, note: t.menu.homeNote },
    { href: '/kios', label: t.menu.kiosk, note: t.menu.kioskNote },
    { href: '/catat', label: t.menu.record, note: t.menu.recordNote },
    { href: '/biaya', label: t.menu.cost, note: t.menu.costNote },
    { href: '/profil', label: t.menu.profile, note: t.menu.profileNote },
    { href: '/langganan', label: t.menu.subscription, note: t.menu.subscriptionNote },
    { href: '/pengaturan', label: t.menu.settings, note: t.menu.settingsNote },
    { href: '#', label: t.menu.wati, note: t.menu.watiNote, soon: true },
    { href: '/dev', label: t.menu.dev, note: t.menu.devNote },
  ];

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
          <Link href="/" className="brand" aria-label={t.nav.home}>
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
          <Link href="/profil" className="topbar__trial" title={t.common.status}>
            {user.role === 'user' ? t.common.activeAccount : t.common.guest} · {template.display_name.split(' ')[0]}
          </Link>
          <button
            type="button"
            className={`burger ${open ? 'is-open' : ''}`}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
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
        <nav className="overlay__nav" aria-label={t.nav.mainMenuAria}>
          <p className="overlay__biz">
            {profile.businessName} <span>· {template.display_name} ({profile.tariffName})</span>
          </p>
          <ul>
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.soon ? (
                  <span className="overlay__link is-soon">
                    <span className="overlay__label">{item.label}</span>
                    <span className="overlay__note">{item.note} · {t.menu.soon}</span>
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

      <nav className="dock" aria-label={t.nav.bottomNavAria}>
        <div className="dock__island">
          {tabs.map((tab) => {
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
