'use client';

import { useState } from 'react';

interface AskResult {
  request_id: string;
  mode: 'mock' | 'hybrid' | 'live';
  confidence: 'high' | 'medium' | 'low';
  answer: string;
  disclaimer: string;
}

interface ErrorBody {
  error: {
    code: string;
    message: string;
    request_id: string;
  };
}

type DemoState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; data: AskResult }
  | { kind: 'error'; data: ErrorBody };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function AiMockDemo() {
  const [state, setState] = useState<DemoState>({ kind: 'idle' });

  async function ask(scenario: 'success' | 'low_confidence' | 'provider_error') {
    setState({ kind: 'loading' });
    try {
      const response = await fetch(`${apiUrl}/ai/ask`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(scenario === 'success' ? {} : { 'x-ai-scenario': scenario }),
        },
        body: JSON.stringify({
          business_id: 'demo_business',
          question: 'Mana yang paling boros?',
        }),
      });
      const payload = (await response.json()) as AskResult | ErrorBody;

      if (!response.ok) {
        setState({ kind: 'error', data: payload as ErrorBody });
        return;
      }
      setState({ kind: 'success', data: payload as AskResult });
    } catch {
      setState({
        kind: 'error',
        data: {
          error: {
            code: 'NETWORK_ERROR',
            message: 'API tidak dapat dihubungi. Jalankan pnpm dev lalu coba lagi.',
            request_id: '-',
          },
        },
      });
    }
  }

  return (
    <section className="panel demo" aria-labelledby="demo-heading">
      <h2 id="demo-heading">Contoh integrasi AI Gateway</h2>
      <p className="demo-lede">
        Tombol ini memanggil <code>/ai/ask</code> dalam mode mock. Perhatikan label{' '}
        <strong>Contoh</strong> dan state gagal yang wajib ditampilkan FE.
      </p>

      <div className="actions">
        <button type="button" onClick={() => ask('success')} disabled={state.kind === 'loading'}>
          Tanya Wati
        </button>
        <button type="button" onClick={() => ask('low_confidence')} disabled={state.kind === 'loading'}>
          Paksa keyakinan rendah
        </button>
        <button type="button" onClick={() => ask('provider_error')} disabled={state.kind === 'loading'}>
          Paksa gagal
        </button>
      </div>

      {state.kind === 'loading' && <p className="demo-note">Memanggil AI Gateway…</p>}

      {state.kind === 'success' && (
        <div className="demo-result" aria-live="polite">
          <div className="demo-meta">
            {state.data.mode === 'mock' && <span className="badge badge-mock">Contoh</span>}
            <span className="badge">Keyakinan: {state.data.confidence}</span>
            <code>{state.data.request_id}</code>
          </div>
          <p>{state.data.answer}</p>
          <p className="demo-note">{state.data.disclaimer}</p>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="demo-error" role="alert" aria-live="assertive">
          <strong>{state.data.error.code}</strong>
          <p>{state.data.error.message}</p>
          <p className="demo-note">Request: {state.data.error.request_id}</p>
          <button type="button" onClick={() => ask('success')}>
            Coba lagi
          </button>
        </div>
      )}
    </section>
  );
}
