import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { CostBreakdown } from './cost-breakdown';

export const metadata = { title: 'Biaya listrik · Voltra' };

export default function BiayaPage() {
  return (
    <main className="page page--wide">
      <section className="page-head">
        <Reveal>
          <Eyebrow>Rincian biaya · 24 jam</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display">
            Ke mana uang listrik Anda <em>pergi</em>
          </h1>
        </Reveal>
      </section>
      <CostBreakdown />
    </main>
  );
}

