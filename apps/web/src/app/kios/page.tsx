'use client';

import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { useVoltraApp } from '@/context/app-context';
import { KiosGame } from '@/features/kios/kios-game';
import { getDictionary } from '@/lib/i18n';

export default function KiosPage() {
  const { settings } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');

  return (
    <main className="page page--wide">
      <section className="page-head">
        <Reveal>
          <Eyebrow>{t.kiosk.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            {t.kiosk.titlePre}
            <em>{t.kiosk.titleHighlight}</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">{t.kiosk.lede}</p>
        </Reveal>
      </section>
      <KiosGame />
    </main>
  );
}

