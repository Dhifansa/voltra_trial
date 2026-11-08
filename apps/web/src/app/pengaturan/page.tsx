'use client';

import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { useVoltraApp } from '@/context/app-context';
import { getDictionary } from '@/lib/i18n';
import { SettingsView } from './settings-view';

export default function PengaturanPage() {
  const { settings } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');

  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>{t.settings.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="display">
            {t.settings.titlePre}
            <em>{t.settings.titleHighlight}</em>
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="lede">{t.settings.lede}</p>
        </Reveal>
      </section>
      <SettingsView />
    </main>
  );
}

