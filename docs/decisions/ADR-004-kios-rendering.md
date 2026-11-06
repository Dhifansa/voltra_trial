# ADR-004: Rendering Kios Virtual dengan DOM/SVG/Canvas, engine menyusul bila perlu

## Status

Accepted — O4 dikunci 2026-11-06. Keputusan ini berlaku untuk prototipe #7 dan Kios Virtual produksi; evaluasi ulang setelah profiling perangkat.

## Date

2026-11-06

## Context

Kios Virtual adalah scene 2D ringan: denah kios, alat-alat, animasi status, dan interaksi misi. Target perangkat adalah Android menengah-bawah; anggaran aset ≤5 MB dan target 30 fps. Tim tidak memiliki pengalaman engine game, dan seluruh UI lain memakai React. PRD membuka opsi DOM/SVG/Canvas atau engine seperti Phaser.

## Decision

Gunakan **DOM + CSS untuk shell dan interaksi**, **SVG untuk scene dan ikon**, dan **Canvas hanya untuk animasi partikel/efek ber-volume tinggi**. Jangan memakai engine game pada MVP.

Aturan implementasi:

- Pisahkan model game (state, aturan, ekonomi) dari renderer. Model tidak boleh bergantung pada DOM.
- Renderer berada di balik antarmuka `KiosRenderer` agar bisa diganti tanpa mengubah aturan game.
- Animasi memakai CSS transform/opacity atau `requestAnimationFrame`; hindari layout thrashing.
- Aset berupa SVG/WebP, bukan sprite sheet besar; total aset scene ≤5 MB.
- Hormati `prefers-reduced-motion`; sediakan mode tanpa animasi.
- Semua angka yang tampil berasal dari `@voltra/energy-calc`; renderer tidak menghitung kWh/Rp.

Escape hatch:

- Bila profiling pada 5 perangkat menunjukkan frame rate atau memori tidak memenuhi target, adopsi **PixiJS** lebih dulu (renderer 2D ringan) sebelum mempertimbangkan Phaser.
- Penggantian renderer harus lewat ADR baru dan tidak mengubah kontrak C2/C4.

## Alternatives Considered

### Phaser
- Pros: ekosistem game lengkap, fisika, sprite, audio.
- Cons: bundle besar, model game cenderung terikat engine, kurva belajar untuk tim web, dan mayoritas fitur tidak dipakai.
- Rejected untuk MVP: overkill untuk scene 2D sederhana.

### Full Canvas
- Pros: kontrol penuh atas rendering.
- Cons: aksesibilitas dan teks sulit, interaksi harus dibangun ulang, debugging lebih lambat.
- Rejected sebagai default; Canvas hanya untuk efek.

### React Native Game Engine / Unity / Godot
- Pros: performa native.
- Cons: menambah platform, bahasa, dan pipeline aset; bertentangan dengan ADR-001.
- Rejected.

## Consequences

- Tidak ada dependensi engine; waktu mulai dan ukuran bundle lebih kecil.
- Scene dapat diuji dengan DOM testing dan screenshot E2E.
- Aksesibilitas lebih mudah: tombol dan label tetap elemen DOM.
- Performa harus dipantau; animasi kompleks bisa lebih mahal daripada canvas.
- Risiko utama: frame drop pada perangkat RAM 2–3 GB. Mitigasi: batasi animasi simultan, uji di perangkat nyata, dan siapkan fallback statis.
- Bila pindah ke PixiJS, model game dan kontrak tetap; hanya lapisan renderer yang berubah.

## Revisit trigger

Setelah prototipe #7 dan profiling 5 perangkat: bila target 30 fps atau memori tidak tercapai, evaluasi PixiJS. Bila kebutuhan scene tumbuh menjadi 3D atau fisika penuh, tulis ADR baru — jangan menambah engine diam-diam.
