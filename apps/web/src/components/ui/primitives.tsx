'use client';

import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ElementType,
  type ReactNode,
} from 'react';
import type { Confidence } from '@voltra/contracts';
import { CONFIDENCE_LABEL } from '@/lib/format';
import { Icon, type IconName } from './icon';

/* ---------- Double-Bezel (Doppelrand): outer shell + inner core ---------- */

export function Bezel({
  children,
  className = '',
  coreClassName = '',
  tone = 'paper',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  coreClassName?: string;
  tone?: 'paper' | 'ink' | 'moss';
  as?: ElementType;
}) {
  return (
    <Tag className={`bezel ${className}`}>
      <div className={`bezel__core bezel__core--${tone} ${coreClassName}`}>{children}</div>
    </Tag>
  );
}

/* ---------- Eyebrow tag ---------- */

export function Eyebrow({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'light' }) {
  return <span className={`eyebrow eyebrow--${tone}`}>{children}</span>;
}

/* ---------- Island button + button-in-button trailing icon ---------- */

type IslandProps = {
  children: ReactNode;
  icon?: IconName;
  variant?: 'solid' | 'ghost';
  className?: string;
};

export function IslandLink({
  href,
  children,
  icon = 'arrow',
  variant = 'solid',
  className = '',
  onClick,
}: IslandProps & { href: string; onClick?: () => void }) {
  return (
    <Link href={href} className={`island island--${variant} ${className}`} onClick={onClick}>
      <span>{children}</span>
      <span className="island__icon">
        <Icon name={icon} size={16} />
      </span>
    </Link>
  );
}

export function IslandButton({
  children,
  icon = 'arrow',
  variant = 'solid',
  className = '',
  ...rest
}: IslandProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  return (
    <button type="button" className={`island island--${variant} ${className}`} {...rest}>
      <span>{children}</span>
      <span className="island__icon">
        <Icon name={icon} size={16} />
      </span>
    </button>
  );
}

/* ---------- Badges ---------- */

export function MockBadge() {
  return (
    <span className="chip chip--mock" title="Data contoh dari AI Gateway mode mock">
      Contoh
    </span>
  );
}

export function ConfidenceBadge({ level, short = false }: { level: Confidence; short?: boolean }) {
  return (
    <span className={`chip chip--conf chip--${level}`}>
      <span className="chip__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {short ? CONFIDENCE_LABEL[level].replace('Keyakinan ', '') : CONFIDENCE_LABEL[level]}
    </span>
  );
}

/* ---------- Scroll reveal (IntersectionObserver, transform + opacity saja) ---------- */

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-shown' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
