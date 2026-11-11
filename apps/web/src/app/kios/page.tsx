'use client';

import { useVoltraApp } from '@/context/app-context';
import { KiosGame } from '@/features/kios/kios-game';

export default function KiosPage() {
  return (
    <main className="page page--wide page--kios">
      <KiosGame />
    </main>
  );
}

