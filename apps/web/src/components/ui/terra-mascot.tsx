'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './icon';

export type TerraMood = 'hallo' | 'biasa' | 'mikir' | 'cemas' | 'hore' | 'tidur';

export const TERRA_ASSET: Record<TerraMood, { src: string; alt: string; badge: string }> = {
  hallo: {
    src: '/Terra Hallo.png',
    alt: 'Terra menyapa',
    badge: 'Terra · Menyapa',
  },
  biasa: {
    src: '/Terra Biasa.png',
    alt: 'Terra tersenyum',
    badge: 'Terra · Siap Bantu',
  },
  mikir: {
    src: '/Terra Mikir.png',
    alt: 'Terra sedang berpikir memberi petunjuk',
    badge: 'Terra · Petunjuk',
  },
  cemas: {
    src: '/Terra Cemas.png',
    alt: 'Terra cemas karena listrik boros',
    badge: 'Terra · Waspada Boros',
  },
  hore: {
    src: '/Terra Hore.png',
    alt: 'Terra merayakan target hemat tercapai',
    badge: 'Terra · Target Tercapai!',
  },
  tidur: {
    src: '/Terra Tidur.png',
    alt: 'Terra sedang istirahat',
    badge: 'Terra · Mode Istirahat',
  },
};

export function TerraAvatar({
  mood,
  size = 64,
  className = '',
}: {
  mood: TerraMood;
  size?: number;
  className?: string;
}) {
  const asset = TERRA_ASSET[mood];
  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={size}
      height={Math.round(size * 1.25)}
      className={`terra-avatar terra-avatar--${mood} ${className}`.trim()}
    />
  );
}

/**
 * Tampilan simpel Tutorial Game bersama Terra:
 * - Gambar karakter Terra berdiri langsung di kiri (tanpa kotak bingkai)
 * - Gelembung Cloud Chat putih bersih di samping kanan Terra dengan ekor balon mengarah ke Terra
 */
export function TerraGameTutorial({
  active,
  mood,
  stepBadge,
  title,
  message,
  tone = 'blue',
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
  onClose,
}: {
  active: boolean;
  mood: TerraMood;
  stepBadge: string;
  title: string;
  message: string;
  tone?: 'blue' | 'green';
  primaryLabel?: string;
  onPrimaryAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  onClose?: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (active) {
      document.body.classList.add('is-game-tutorial');
    } else {
      document.body.classList.remove('is-game-tutorial');
    }
    return () => {
      document.body.classList.remove('is-game-tutorial');
    };
  }, [active, mounted]);

  if (!mounted || !active) return null;

  return createPortal(
    <>
      <div className="game-tutorial-backdrop" aria-hidden="true" />

      <aside
        className={`terra-chat-tutorial terra-chat-tutorial--${tone}`}
        role="region"
        aria-label={`Petunjuk Terra: ${stepBadge}`}
        aria-live="polite"
      >
        {/* Karakter Terra langsung tanpa bingkai kotak */}
        <div className="terra-chat-tutorial__character">
          <TerraAvatar mood={mood} size={86} />
        </div>

        {/* Cloud Chat Bubble di samping Terra */}
        <div className="terra-chat-cloud">
          <div className="terra-chat-cloud__top">
            <span className="terra-chat-cloud__step">{stepBadge}</span>
            {onClose && (
              <button
                type="button"
                className="terra-chat-cloud__close"
                onClick={onClose}
                aria-label="Tutup petunjuk"
                title="Tutup petunjuk"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </div>

          <p className="terra-chat-cloud__title">{title}</p>
          <p className="terra-chat-cloud__msg">{message}</p>

          {(onPrimaryAction || onSecondaryAction) && (
            <div className="terra-chat-cloud__actions">
              {onSecondaryAction && secondaryLabel && (
                <button
                  type="button"
                  className="terra-chat-cloud__btn terra-chat-cloud__btn--ghost"
                  onClick={onSecondaryAction}
                >
                  {secondaryLabel}
                </button>
              )}
              {onPrimaryAction && primaryLabel && (
                <button
                  type="button"
                  className="terra-chat-cloud__btn terra-chat-cloud__btn--primary"
                  onClick={onPrimaryAction}
                >
                  <span>{primaryLabel}</span>
                  <Icon name="arrow" size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
}
