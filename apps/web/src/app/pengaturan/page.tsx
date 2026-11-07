import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { SettingsView } from './settings-view';

export const metadata = { title: 'Pengaturan · Voltra' };

export default function PengaturanPage() {
  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>Preferensi & Privasi</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="display">
            Pengaturan <em>aplikasi</em>
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="lede">
            Atur pengingat Misi Meter via WhatsApp, mode tampilan, dan kendali penuh atas data usaha Anda.
          </p>
        </Reveal>
      </section>
      <SettingsView />
    </main>
  );
}

