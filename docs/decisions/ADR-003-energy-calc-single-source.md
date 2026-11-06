# ADR-003: Satu pustaka `energy-calc`, LLM tidak menghasilkan angka

## Status

Accepted — prinsip inti PRD (C2, P8, Bagian 8 dan 10). O17 dikunci 2026-11-06 sebagai paket TypeScript di monorepo.

## Date

2026-11-05 (O17 diputuskan 2026-11-06)

## Context

Angka kWh/Rupiah muncul di simulasi game, estimasi, rekomendasi, laporan, verifikasi, dan Tanya Wati. Bila setiap modul menghitung sendiri atau LLM mengarang angka, hasil antar-layar tidak konsisten dan klaim penghematan tidak dapat diaudit. PRD menetapkan `energy-calc` sebagai satu-satunya sumber hitung.

## Decision

1. Semua perhitungan kWh, Rupiah, faktor beban, estimasi, cross-validation, verifikasi, dan ROI berada di `packages/energy-calc`.
2. Game, backend, laporan, dan Wati memakai keluaran pustaka tersebut; tidak ada rumus duplikat.
3. LLM hanya menyusun teks dari objek hasil yang sudah berisi angka.
4. Validator memeriksa bahwa teks LLM tidak memuat angka baru; bila gagal, jawaban diblokir dan diganti template.
5. Setiap keluaran menyertakan `engine_version` dan tingkat keyakinan.
6. **O17:** implementasi adalah paket TypeScript `@voltra/energy-calc` di monorepo, bukan layanan terpisah. FE dan BE mengimpor paket yang sama. Tidak ada API hitung terpisah pada MVP.

Konsekuensi teknis:

- Paket harus bebas dari dependensi Node.js sehingga bisa berjalan di browser dan server.
- Input/output memakai tipe C2 di `@voltra/contracts`; perubahan bentuk harus lewat versi kontrak.
- Paket tidak boleh mengakses database, jaringan, atau jam sistem secara implisit; waktu dan tarif selalu menjadi input.

## Alternatives Considered

### Rumus terpisah per modul
- Pros: modul mandiri.
- Cons: angka tidak konsisten, sulit diaudit, game dan laporan bisa berbeda.
- Rejected: melanggar aturan emas C2.

### LLM menghitung atau membulatkan angka
- Pros: jawaban lebih fleksibel.
- Cons: halusinasi, tidak dapat direproduksi, melanggar batas klaim.
- Rejected.

### Layanan hitung terpisah (microservice)
- Pros: isolasi dan scaling sendiri.
- Cons: menambah latensi, deployment, dan titik gagal; FE tetap butuh perhitungan lokal untuk simulasi.
- Rejected untuk MVP: paket TypeScript lebih murah dan tidak menduplikasi rumus.

## Consequences

- FE dan BE berbagi paket TypeScript yang sama.
- Perubahan rumus harus melalui test golden dan review.
- Mock juga memakai bentuk hasil C2; mock tidak boleh menampilkan penghematan pasti.
- Validator dan contract test menjadi gate wajib di CI.
- Bila LLM mengembalikan angka baru, respons gagal dengan aman (fallback template), bukan ditampilkan.
- Ukuran bundle FE perlu dipantau; paket harus tree-shakeable dan tanpa dependensi berat.

## Enforcement

- Unit/golden test untuk contoh hitung PRD.
- Contract test untuk bentuk hasil dan `engine_version`.
- Code review checklist: cari `kwh`, `rp`, `tariff`, `load_factor` di luar `energy-calc`.
- E2E memeriksa label **Simulasi/Estimasi/Contoh/Belum cukup data**.

## Revisit trigger

Bila kebutuhan keamanan atau distribusi mengharuskan perhitungan diisolasi dari klien, buat layanan tipis di belakang kontrak C2 yang sama; paket tetap menjadi implementasi referensi dan sumber golden test.
