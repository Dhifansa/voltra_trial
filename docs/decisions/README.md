# Architecture Decision Records

ADR mencatat keputusan teknis yang mengikat pekerjaan berikutnya. Bila kode dan ADR berbeda, ADR yang berlaku sampai diganti lewat ADR baru.

| ADR | Keputusan | Status | Terkait |
|---|---|---|---|
| [ADR-001](ADR-001-pwa-capacitor.md) | PWA React/Next.js + Capacitor sebagai platform mobile | Accepted (O1) | #5, #6 |
| [ADR-002](ADR-002-modular-monolith.md) | Modular monolith TypeScript/NestJS + PostgreSQL/Redis/S3 | Accepted (O17) | #3, #5 |
| [ADR-003](ADR-003-energy-calc-single-source.md) | Satu paket `energy-calc`; LLM tidak menghasilkan angka | Accepted | #21, #39 |
| [ADR-004](ADR-004-kios-rendering.md) | Kios Virtual DOM/SVG/Canvas; engine menyusul bila perlu | Accepted (O4) | #7, #17 |

## Cara mengubah keputusan

1. ADR lama tidak diedit untuk mengubah keputusan; tulis ADR baru dan tandai ADR lama sebagai `Superseded by ADR-xxx`.
2. Buka issue/PR yang menjelaskan alasan, dampak, dan migrasi.
3. Perbarui [`tasks/plan.md`](../../tasks/plan.md) dan [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) agar tidak ada dua sumber status.
