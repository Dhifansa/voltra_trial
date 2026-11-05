# ADR-001: PWA + Capacitor sebagai platform mobile awal

## Status
Proposed — rekomendasi sementara PRD O1, ditinjau akhir Sprint S1.

## Date
2026-11-05

## Context
Tim kecil (4 orang), waktu menuju demo terbatas, dan sebagian besar anggota sudah menggunakan web/React. Aplikasi membutuhkan kamera, mikrofon, voice note, notifikasi, dan animasi Kios Virtual yang ringan di Android menengah-bawah. PRD membuka tiga opsi: PWA + Capacitor, React Native/Expo, atau Flutter.

## Decision
Gunakan **TypeScript + React + Next.js sebagai PWA**, dengan **Capacitor** sebagai wrapper APK bila diperlukan. Ini keputusan sementara sampai O1 divalidasi pada 5 perangkat Android umum.

## Alternatives Considered

### React Native / Expo
- Pros: pengalaman native, push notification lebih stabil.
- Cons: kurva belajar, animasi game 2D butuh pustaka tambahan, berbagi kode dengan web lebih terbatas.
- Rejected untuk saat ini: kecepatan demo dan kapasitas tim lebih cocok dengan web.

### Flutter
- Pros: UI dan game 2D konsisten.
- Cons: bahasa baru bagi tim; tidak ada anggota berpengalaman Flutter.
- Rejected untuk saat ini.

## Consequences
- Satu basis kode web/Android; instalasi tanpa Play Store tetap mungkin.
- Push notification iOS terbatas; pengingat misi mengandalkan WhatsApp opt-in.
- Kamera/mikrofon harus diuji lintas browser; sediakan unggah galeri dan input manual.
- Animasi game harus hemat aset (target ≤5 MB, 30 fps).
- Bila uji perangkat menunjukkan masalah serius, tulis ADR baru yang supersedes dan pindah ke RN/Expo.

## Revisit trigger
Akhir S1 atau setelah uji 5 perangkat: bila kamera/mikrofon/notifikasi gagal pada mayoritas perangkat target, evaluasi ulang O1 sebelum Kios Virtual produksi.
