'use client';

import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { useVoltraApp } from '@/context/app-context';
import { getDictionary } from '@/lib/i18n';
import { CaptureFlow } from './capture-flow';

export default function CatatPage() {
  const { settings } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');

  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>{t.capture.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            {t.capture.titlePre}
            <em>{t.capture.titleHighlight}</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">{t.capture.lede}</p>
        </Reveal>
      </section>
      <CaptureFlow />
    </main>
  );
}

