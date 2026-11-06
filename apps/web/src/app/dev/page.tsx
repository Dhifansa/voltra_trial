import { CONTRACT_VERSION } from '@voltra/contracts';
import { ENGINE_VERSION } from '@voltra/energy-calc';
import { AiMockDemo } from '../ai-mock-demo';
import { Bezel, Eyebrow } from '@/components/ui/primitives';

/** Halaman pengembang: status workspace + demo AI Gateway (dipindah dari beranda scaffold S1). */
export default function DevPage() {
  return (
    <main className="page">
      <section className="page-head">
        <Eyebrow>Pengembang</Eyebrow>
        <h1 className="display">
          Status <em>workspace</em>
        </h1>
      </section>

      <Bezel>
        <dl className="facts">
          <div>
            <dt>Kontrak</dt>
            <dd>{CONTRACT_VERSION}</dd>
          </div>
          <div>
            <dt>Mesin hitung</dt>
            <dd>{ENGINE_VERSION}</dd>
          </div>
          <div>
            <dt>API</dt>
            <dd>
              <code>/health</code>
            </dd>
          </div>
        </dl>
      </Bezel>

      <Bezel className="mt">
        <AiMockDemo />
      </Bezel>
    </main>
  );
}

