# Voltra

Voltra membantu pemilik UMKM menjawab dua pertanyaan:

1. **Ke mana uang listrik usaha saya pergi?**
2. **Apa yang harus saya ubah agar pemakaian listrik lebih efisien?**

Jawaban disajikan dalam Rupiah dan biaya per satuan usaha (misalnya Rp/kg cucian atau Rp/porsi), lengkap dengan estimasi, dasar perhitungan, dan tingkat keyakinan.

**Status:** Fase 0 — Validasi & Fondasi (November 2026). Scaffold S1 sudah tersedia: workspace pnpm, PWA shell, API health check, paket bersama, CI, dan kontrak C1–C6 release candidate v0.1.0.

> Repo ini **privat**. Collaborator harus menerima undangan GitHub terlebih dahulu; setelah itu README, dokumen, issue, dan Project board bisa diakses.

## Mulai dari mana

1. Baca halaman ini untuk gambaran produk dan prinsip kerja.
2. [`docs/TEAM.md`](docs/TEAM.md) — siapa mengerjakan apa dan batas kerja.
3. [`docs/ROADMAP.md`](docs/ROADMAP.md) — urutan sprint dan release gate.
4. [`tasks/plan.md`](tasks/plan.md) — indeks 53 issue dengan owner dan estimasi.
5. [`CONTRIBUTING.md`](CONTRIBUTING.md) — alur branch, commit, PR, dan definition of done.

Untuk melihat pekerjaan: buka [Project board](https://github.com/users/MahdiHbb1/projects/3), lalu filter **Owner** sesuai nama Anda. Issue GitHub adalah sumber status; dokumen hanya ringkasan.

## Dokumen utama

| Dokumen | Isi |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | PRD Terpadu v0.3.1 — sumber kebenaran produk, AI, gamifikasi, dan monetisasi |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arsitektur sistem, modul, alur data, dan stack usulan |
| [`docs/CONTRACTS.md`](docs/CONTRACTS.md) | Kontrak C1–C6 v0.1.0, katalog endpoint AI, konvensi respons, aturan versi |
| [`docs/AI-GATEWAY.md`](docs/AI-GATEWAY.md) | Mode mock/hybrid/live, skenario, endpoint, dan cara memaksa kegagalan |
| [`docs/ENERGY-CALC.md`](docs/ENERGY-CALC.md) | Rumus kWh/Rupiah, ambang keyakinan, golden test, dan batas paket |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Fase produk, sprint S1–S8, critical path, dan release gate |
| [`docs/TEAM.md`](docs/TEAM.md) | Peran, ownership, dan protokol handoff |
| [`tasks/plan.md`](tasks/plan.md) | Rencana implementasi dan indeks issue GitHub |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Alur branch, commit, PR, review, dan definition of done |

## Tech stack (provisional)

| Lapisan | Pilihan |
|---|---|
| Bahasa | TypeScript |
| Frontend | React + Next.js (PWA) |
| Mobile wrapper | Capacitor |
| Backend | NestJS modular monolith |
| Database | PostgreSQL |
| Queue/cache | Redis + BullMQ |
| File storage | S3-compatible object storage |
| Mesin hitung | Paket `energy-calc` |
| Game 2D | DOM/SVG/Canvas dulu |
| AI | AI Gateway `mock`/`hybrid`/`live` |
| Test | Vitest + Playwright + contract test |
| CI | GitHub Actions + pnpm |

Stack ini **sudah dikunci untuk S1**. Keputusan O1/O4/O17 ada di ADR-001/003/004; provider AI, OTP, pembayaran, dan deployment belum diputuskan.

## Tracking

- **Project board:** <https://github.com/users/MahdiHbb1/projects/3> — 53 issue, field Owner/Workstream/Sprint/Priority/QA Gate/Estimate
- **Issues:** <https://github.com/MahdiHbb1/voltra/issues>
- **Milestones:** <https://github.com/MahdiHbb1/voltra/milestones>

## Tim

| Anggota | GitHub | Peran | Fokus utama |
|---|---|---|---|
| Dhifansa | [@Dhifansa](https://github.com/Dhifansa) | Frontend Engineer | Aplikasi FE, Kios Virtual, gamifikasi, design system |
| Mahdi | [@MahdiHbb1](https://github.com/MahdiHbb1) | Backend + AI Engineer | API, data, kontrak, AI Gateway mock, `energy-calc`, infra |
| Muchsin | — | AI Integration & Subscription Engineer | Mengisi placeholder AI, OCR/STT/LLM live, fitur Plus AI, biaya AI |
| Yusri | [@yuzhuruuu](https://github.com/yuzhuruuu) | QA / E2E Engineer | Test strategy, contract/E2E test, dataset evaluation, release gate |

Detail ownership ada di [`docs/TEAM.md`](docs/TEAM.md).

## Prinsip yang tidak boleh dilanggar

- **Satu sumber hitung.** Semua kWh/Rupiah berasal dari paket `energy-calc`; game, backend, laporan, dan Wati tidak boleh punya rumus sendiri.
- **LLM tidak membuat angka.** LLM hanya menjelaskan angka yang sudah dihitung. Validator memblokir angka baru.
- **Keyakinan eksplisit.** Setiap estimasi membawa Tinggi/Sedang/Rendah; data kurang ditampilkan sebagai "belum cukup data".
- **Tidak ada klaim real-time.** Tanpa sensor/AMI, Voltra menganalisis setelah input masuk, bukan memantau tiap alat 24 jam.
- **Selisih tidak dibagi paksa.** Energi yang belum terjelaskan ditampilkan apa adanya.
- **Manusia memutuskan.** Rekomendasi tidak dijalankan otomatis; pemilik usaha menyetujui, menolak, atau menunda.
- **Mock berlabel "Contoh".** Mock tidak boleh menampilkan penghematan pasti dan tidak boleh dipakai di pilot/produksi.
- **Privasi default.** Foto, suara, dan data usaha adalah data pribadi; pengguna dapat melihat dan menghapus datanya.

## Struktur repo

```text
apps/
  web/                 # PWA React/Next.js + Capacitor (ADR-001)
  api/                 # Modular monolith NestJS (ADR-002)
packages/
  contracts/           # Skema C1–C6, OpenAPI, fixture, tipe (v0.1.0)
  energy-calc/         # Satu-satunya pustaka hitung kWh/Rupiah (C2)
tests/
  contract/            # Contract test C1–C6 (issue #12)
  e2e/                 # Playwright E2E (issue #9)
docs/
  decisions/           # ADR + indeks keputusan
  PRD.md
tasks/
  plan.md              # Rencana + indeks issue
```

## Mulai

Prasyarat: Node.js >=20.9 (disarankan 22, lihat `.nvmrc`) dan pnpm 10.

```bash
pnpm install
pnpm dev
```

- Web: <http://localhost:3000>
- API health: <http://localhost:3001/health>
- Salin `.env.example` menjadi `.env` bila mulai memakai layanan eksternal. Scaffold saat ini belum membutuhkan kredensial.

Perintah wajib sebelum membuka PR:

| Perintah | Isi |
|---|---|
| `pnpm lint` | ESLint seluruh workspace |
| `pnpm typecheck` | TypeScript seluruh workspace |
| `pnpm test` | Vitest (unit) |
| `pnpm build` | Build paket, API, dan PWA |
| `pnpm test:contract` | Contract test C1–C6: JSON Schema, fixture, dan OpenAPI |

Build semua workspace mengikuti urutan dependensi: `contracts`/`energy-calc` lebih dulu, lalu `api`/`web`.

## Kontribusi

Baca [`CONTRIBUTING.md`](CONTRIBUTING.md). Semua perubahan masuk lewat issue dan pull request; perubahan kontrak C1–C6 harus disetujui seluruh pemilik area.
