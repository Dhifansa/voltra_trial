import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Voltra — Listrik UMKM',
    short_name: 'Voltra',
    description: 'Ke mana uang listrik usaha Anda pergi, dan apa yang bisa diubah.',
    lang: 'id',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
