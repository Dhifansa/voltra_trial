# Tim dan Ownership

## Peran

| Anggota | Peran | Fokus | Keputusan utama |
|---|---|---|---|
| **Dhifansa** | Frontend Engineer | Shell aplikasi, design system, Kios Virtual, gamifikasi, capture/report UI, paywall | UX dan implementasi FE |
| **Mahdi** | Backend + AI Engineer | API modular monolith, data model, auth/entitlement/trial, kontrak C1–C6, AI Gateway mock, `energy-calc`, infra/CI | Arsitektur backend, kontrak, mesin energi |
| **Muchsin** | AI Integration & Subscription Engineer | Mengisi placeholder AI dengan layanan live (OCR/STT/LLM), pipeline Plus P10–P13, kuota/biaya AI, `ai_usage` | Pilihan provider AI, kualitas & biaya AI |
| **Yusri** | QA / E2E Engineer | Test strategy, Playwright E2E, contract test, dataset evaluation, anti-cheat verification, release gate | Kesiapan rilis dan bukti kualitas |

Mahdi saat ini memegang akses admin repo GitHub (`@MahdiHbb1`). Username GitHub anggota lain dicatat setelah dikonfirmasi.

## Ownership area

| Area | Pemilik | Path target | Reviewer wajib |
|---|---|---|---|
| Frontend app & design system | Dhifansa | `apps/web/**` | Mahdi atau Yusri |
| Kios Virtual & gamifikasi | Dhifansa | `apps/web/**/game/**`, `packages/contracts/templates/**` | Mahdi (kontrak C1/C4) |
| Backend & data | Mahdi | `apps/api/**`, `packages/contracts/**` | Muchsin atau Dhifansa |
| AI Gateway & `energy-calc` | Mahdi | `apps/api/src/ai/**`, `packages/energy-calc/**` | Muchsin (AI) / Yusri (test) |
| AI live & Plus AI | Muchsin | `apps/api/src/ai/adapters/**`, `apps/api/src/plus/**` | Mahdi |
| QA, E2E, fixtures | Yusri | `tests/**`, `fixtures/**`, `.github/workflows/qa*` | Mahdi |
| Dokumentasi produk & delivery | Mahdi (sementara) | `docs/**`, `tasks/**`, `README.md` | seluruh tim |

## Batas kerja

- **Kontrak dulu, baru implementasi.** FE dan BE tidak menunggu kode satu sama lain; keduanya bekerja dari kontrak dan fixture mock.
- **Mock adalah kontrak yang dapat dijalankan.** Setiap endpoint AI punya fixture sukses, keyakinan rendah, dan gagal. FE wajib bisa menampilkan ketiganya.
- **Tidak ada rumus di FE.** Simulasi Kios memanggil `energy-calc` (atau hasil yang sudah dihitung backend), bukan menghitung ulang kWh/Rp sendiri.
- **QA bukan tahap akhir.** Yusri menulis acceptance/E2E test sejak S1 dan dapat memblokir merge bila gate P0 gagal.
- **Perubahan kontrak harus disetujui bersama.** Lihat `CONTRIBUTING.md`.

## Protokol handoff

### FE → BE
1. FE membuka issue dengan kebutuhan data, contoh payload, dan state UI (loading/empty/error/low-confidence).
2. BE menambahkan/mengubah kontrak + fixture mock.
3. FE mengimplementasikan terhadap mock; BE mengganti adapter tanpa mengubah bentuk respons.

### BE → AI
1. Mahdi menyediakan interface adapter dan skema respons.
2. Muchsin mengisi adapter live, menambahkan timeout/retry/fallback, dan mencatat `ai_usage`.
3. Yusri menambahkan contract/eval test sebelum flag live diaktifkan.

### AI → QA
1. Muchsin menyerahkan provider, prompt/model, biaya per panggilan, dan contoh keluaran.
2. Yusri menjalankan D-OCR/D-STT dan mencatat akurasi, latensi, serta kasus gagal.
3. Flag live hanya naik bila gerbang kualitas PRD terpenuhi.

## Ritme kerja

- **Sprint 2 minggu** (S1–S8) sesuai `docs/ROADMAP.md`.
- **Sprint planning:** pilih issue `Ready`, kunci acceptance criteria, tentukan owner.
- **Async standup:** update singkat di issue/PR; tidak perlu rapat harian.
- **Sprint review:** demo alur vertikal, bukan status task.
- **Retro singkat:** satu hal yang dilanjutkan, satu hal yang dihentikan.

## Eskalasi

- Perbedaan pendapat kontrak → diskusi di issue; bila tetap buntu, Mahdi memutuskan arah teknis dan mencatat ADR.
- Perubahan scope produk → catat di `tasks/plan.md` dan keputusan terbuka PRD; jangan diam-diam menambah fitur.
- Risiko privasi/keamanan → hentikan pekerjaan terkait dan libatkan seluruh tim.
