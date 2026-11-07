import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { OnboardingFlow } from './onboarding-flow';

export const metadata = { title: 'Masuk & Profiling Usaha · Voltra' };

export default function MasukPage() {
  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>Pengenalan · 3 Langkah</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="display">
            Masuk, atur profil usaha, lalu buka <em>Kios 2D</em>
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="lede">
            Semua alat di Beranda, Catat, Keuangan/Biaya, dan Kios Virtual akan otomatis menyesuaikan dengan jenis usaha yang Anda pilih.
          </p>
        </Reveal>
      </section>
      <OnboardingFlow />
    </main>
  );
}

