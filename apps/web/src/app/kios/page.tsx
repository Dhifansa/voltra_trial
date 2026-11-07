import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { KiosGame } from '@/features/kios/kios-game';

export const metadata = { title: 'Kios Virtual · Voltra' };

export default function KiosPage() {
  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>Kios Virtual · gratis</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            Lihat listrik kios dalam <em>Rupiah</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">Pilih jenis usaha, ketuk alat, geser jam pakainya, dan lihat tagihan simulasi berubah.</p>
        </Reveal>
      </section>
      <KiosGame />
    </main>
  );
}

