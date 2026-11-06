# ADR-001: PWA + Capacitor sebagai platform mobile awal

## Status

Accepted — O1 dikunci 2026-11-06. Validasi perangkat tetap menjadi gate S2/S3, bukan alasan menunda scaffold.

## Date

2026-11-05 (diputuskan 2026-11-06)

## Context

Tim kecil (4 orang), waktu menuju demo terbatas, dan sebagian besar anggota sudah menggunakan web/React. Aplikasi membutuhkan kamera, mikrofon, voice note, notifikasi, dan animasi Kios Virtual yang ringan di Android menengah-bawah. PRD membuka tiga opsi: PWA + Capacitor, React Native/Expo, atau Flutter.

## Decision

Gunakan **TypeScript + React + Next.js sebagai PWA**, dengan **Capacitor** sebagai wrapper APK bila diperlukan.

Alasan:

- Satu bahasa dan satu basis kode untuk FE, BE, dan `energy-calc`.
- Tim sudah React; tidak ada waktu untuk kurva belajar RN/Flutter.
- PWA bisa diuji langsung di browser dan dibagikan lewat tautan saat demo.
- Capacitor memberi jalur APK tanpa menulis ulang aplikasi.

Validasi perangkat (gate S2/S3):

- Uji minimal 5 perangkat Android umum, termasuk RAM 2–3 GB.
- Periksa izin kamera, mikrofon, pemutaran voice note, instalasi PWA, dan notifikasi.
- Sediakan fallback unggah galeri dan input manual untuk setiap input foto/suara.
- Catat hasil di issue #28 (QA capture + matriks 5 perangkat).

## Alternatives Considered

### React Native / Expo
- Pros: pengalaman native, push notification lebih stabil.
- Cons: kurva belajar, animasi game 2D butuh pustaka tambahan, berbagi kode dengan web lebih terbatas.
- Rejected: kecepatan demo dan kapasitas tim lebih cocok dengan web.

### Flutter
- Pros: UI dan game 2D konsisten.
- Cons: bahasa baru bagi tim; tidak ada anggota berpengalaman Flutter.
- Rejected: risiko belajar terlalu besar untuk timeline S1–S8.

## Consequences

- Satu basis kode web/Android; instalasi tanpa Play Store tetap mungkin.
- Push notification iOS terbatas; pengingat misi mengandalkan WhatsApp opt-in.
- Kamera/mikrofon harus diuji lintas browser; sediakan unggah galeri dan input manual.
- Animasi game harus hemat aset (target ≤5 MB, 30 fps); renderer dibahas di ADR-004.
- Performa kamera dan game pada perangkat kelas bawah adalah risiko utama; profil di perangkat nyata, bukan hanya emulator.
- Bila uji perangkat menunjukkan masalah serius, tulis ADR baru yang supersedes dan pindah ke RN/Expo.

## Revisit trigger

Setelah uji 5 perangkat: bila kamera, mikrofon, atau notifikasi gagal pada mayoritas perangkat target, evaluasi ulang O1 sebelum Kios Virtual produksi. Keputusan pindah platform harus lewat ADR baru, bukan perubahan diam-diam.
