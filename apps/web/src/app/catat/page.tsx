import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { CaptureFlow } from './capture-flow';

export const metadata = { title: 'Catat data · Voltra' };

export default function CatatPage() {
  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>Kurang dari 2 menit</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            Catat hari ini, <em>tanpa ribet</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">Foto meter, foto label alat, atau cukup bicara. Selalu bisa dikoreksi sebelum disimpan.</p>
        </Reveal>
      </section>
      <CaptureFlow />
    </main>
  );
}

