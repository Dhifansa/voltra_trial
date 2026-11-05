# Wattera

Wattera membantu pemilik UMKM menjawab dua pertanyaan:

1. **Ke mana uang listrik usaha saya pergi?**
2. **Apa yang harus saya ubah agar pemakaian listrik lebih efisien?**

Jawaban disajikan dalam Rupiah dan biaya per satuan usaha (misalnya Rp/kg cucian atau Rp/porsi), lengkap dengan estimasi, dasar perhitungan, dan tingkat keyakinan.

**Status:** Fase 0 — Validasi & Fondasi (November 2026). Repo ini menjadi sumber dokumen produk, kontrak, dan rencana delivery. Scaffold aplikasi dikerjakan pada Sprint S1.

## Dokumen utama

| Dokumen | Isi |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | PRD Terpadu v0.3.1 — sumber kebenaran produk, AI, gamifikasi, dan monetisasi |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arsitektur sistem, modul, alur data, dan stack usulan |
| [`docs/CONTRACTS.md`](docs/CONTRACTS.md) | Kontrak C1–C6, katalog endpoint AI, konvensi respons, aturan versi |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Fase produk, sprint S1–S8, critical path, dan release gate |
| [`docs/TEAM.md`](docs/TEAM.md) | Peran, ownership, dan protokol handoff |
| [`tasks/plan.md`](tasks/plan.md) | Rencana implementasi dan indeks issue GitHub |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Alur branch, commit, PR, review, dan definition of done |

## Tracking

- **Project board:** <https://github.com/users/MahdiHbb1/projects/3> — 53 issue, field Owner/Workstream/Sprint/Priority/QA Gate/Estimate
- **Issues:** <https://github.com/MahdiHbb1/wattera/issues>
- **Milestones:** <https://github.com/MahdiHbb1/wattera/milestones>

## Tim

| Anggota | Peran | Fokus utama |
|---|---|---|
| Dhifansa | Frontend Engineer | Aplikasi FE, Kios Virtual, gamifikasi, design system |
| Mahdi | Backend + AI Engineer | API, data, kontrak, AI Gateway mock, `energy-calc`, infra |
| Muchsin | AI Integration & Subscription Engineer | Mengisi placeholder AI, OCR/STT/LLM live, fitur Plus AI, biaya AI |
| Yusri | QA / E2E Engineer | Test strategy, contract/E2E test, dataset evaluation, release gate |

Detail ownership ada di [`docs/TEAM.md`](docs/TEAM.md).

## Prinsip yang tidak boleh dilanggar

- **Satu sumber hitung.** Semua kWh/Rupiah berasal dari paket `energy-calc`; game, backend, laporan, dan Wati tidak boleh punya rumus sendiri.
- **LLM tidak membuat angka.** LLM hanya menjelaskan angka yang sudah dihitung. Validator memblokir angka baru.
- **Keyakinan eksplisit.** Setiap estimasi membawa Tinggi/Sedang/Rendah; data kurang ditampilkan sebagai "belum cukup data".
- **Tidak ada klaim real-time.** Tanpa sensor/AMI, Wattera menganalisis setelah input masuk, bukan memantau tiap alat 24 jam.
- **Selisih tidak dibagi paksa.** Energi yang belum terjelaskan ditampilkan apa adanya.
- **Manusia memutuskan.** Rekomendasi tidak dijalankan otomatis; pemilik usaha menyetujui, menolak, atau menunda.
- **Mock berlabel "Contoh".** Mock tidak boleh menampilkan penghematan pasti dan tidak boleh dipakai di pilot/produksi.
- **Privasi default.** Foto, suara, dan data usaha adalah data pribadi; pengguna dapat melihat dan menghapus datanya.

## Struktur repo (target)

```text
apps/
  web/                 # PWA React/Next.js + Capacitor (ADR-001)
  api/                 # Modular monolith TypeScript (ADR-002)
packages/
  contracts/           # Skema C1–C6 + OpenAPI (C3)
  energy-calc/         # Satu-satunya pustaka hitung kWh/Rupiah (C2)
tests/
  contract/            # Contract test C1–C6
  e2e/                 # Playwright E2E
docs/
  decisions/           # ADR
  PRD.md
tasks/
  plan.md              # Rencana + indeks issue
```

## Mulai

Belum ada scaffold aplikasi. Sprint S1 akan menambahkan workspace, perintah dev/build/test, dan `.env.example`. Setelah itu README ini akan memuat quick start yang dapat dijalankan.

## Kontribusi

Baca [`CONTRIBUTING.md`](CONTRIBUTING.md). Semua perubahan masuk lewat issue dan pull request; perubahan kontrak C1–C6 harus disetujui seluruh pemilik area.
