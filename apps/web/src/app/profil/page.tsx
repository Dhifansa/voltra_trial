import { Eyebrow, Reveal } from '@/components/ui/primitives';
import { ProfileView } from './profile-view';

export const metadata = { title: 'Profil Usaha · Voltra' };

export default function ProfilPage() {
  return (
    <main className="page">
      <section className="page-head">
        <Reveal>
          <Eyebrow>Akun & Profil Usaha</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="display">
            Profil <em>kios & usaha</em> Anda
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="lede">
            Perubahan jenis usaha, golongan tarif PLN, atau volume harian di sini langsung memperbarui Kios 2D, Beranda, Biaya, dan Catat.
          </p>
        </Reveal>
      </section>
      <ProfileView />
    </main>
  );
}

