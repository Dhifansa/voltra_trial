'use client';

import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { useVoltraApp } from '@/context/app-context';
import { getDictionary } from '@/lib/i18n';
import { CostBreakdown } from './cost-breakdown';

export default function BiayaPage() {
  const { settings } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');

  return (
    <main className="page page--wide">
      <section className="page-head">
        <Reveal>
          <Eyebrow>{t.cost.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            {t.cost.titlePre}
            <em>{t.cost.titleHighlight}</em>
          </h1>
        </Reveal>
      </section>
      <CostBreakdown />
    </main>
  );
}

