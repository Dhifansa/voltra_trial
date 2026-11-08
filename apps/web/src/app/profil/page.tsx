'use client';

import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { useVoltraApp } from '@/context/app-context';
import { getDictionary } from '@/lib/i18n';
import { ProfileView } from './profile-view';

export default function ProfilPage() {
  const { settings } = useVoltraApp();
  const t = getDictionary(settings.language || 'id');

  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>{t.profile.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="display">
            {t.profile.titlePre}
            <em>{t.profile.titleHighlight}</em>
            {t.profile.titlePost}
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="lede">{t.profile.lede}</p>
        </Reveal>
      </section>
      <ProfileView />
    </main>
  );
}

