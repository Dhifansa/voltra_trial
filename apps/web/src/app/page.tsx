import { CONTRACT_VERSION } from '@voltra/contracts';
import { ENGINE_VERSION } from '@voltra/energy-calc';

export default function HomePage() {
  return (
    <main className="page">
      <header className="header">
        <span className="brand">Voltra</span>
        <span className="badge">Scaffold S1</span>
      </header>

      <h1>Analisis biaya listrik untuk UMKM.</h1>
      <p className="lede">
        Workspace ini adalah fondasi aplikasi Voltra. Halaman ini hanya memastikan
        PWA, API, dan paket bersama berjalan dari satu monorepo.
      </p>

      <section className="panel" aria-labelledby="status-heading">
        <h2 id="status-heading">Status workspace</h2>
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
      </section>

      <p className="note">
        Semua angka kWh dan Rupiah nantinya berasal dari paket{' '}
        <code>@voltra/energy-calc</code>. LLM tidak menghasilkan angka.
      </p>
    </main>
  );
}
