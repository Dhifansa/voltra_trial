# Contributing

## Prinsip kerja

- `main` harus selalu dapat di-build dan di-test.
- Branch hidup singkat (1–3 hari), lalu merge lewat PR.
- Satu PR = satu tujuan. Jangan campur refactor, formatting, dan fitur.
- Kontrak C1–C6 dibekukan per sprint. Perubahan kontrak harus lewat PR terpisah dan disetujui pemilik area.
- Jangan commit secret, file `.env`, data pribadi pengguna, atau foto/suara asli ke repo.

## Alur issue

```text
Backlog -> Ready -> In Progress -> In Review -> Done
                         |
                      Blocked
```

- **Backlog:** belum dijadwalkan.
- **Ready:** acceptance criteria jelas, dependensi selesai, siap dikerjakan.
- **In Progress:** satu orang mengerjakan; update issue bila scope berubah.
- **In Review:** PR terbuka dan menunggu review/QA.
- **Blocked:** tulis alasan dan pihak yang dibutuhkan di komentar issue.
- **Done:** acceptance criteria terpenuhi, CI hijau, dokumentasi diperbarui.

Jangan memindahkan issue ke **Done** hanya karena PR sudah di-merge. QA gate harus lulus untuk item yang memengaruhi alur pengguna.

## Branch

```text
feature/<issue>-<slug>     contoh: feature/12-guest-claim
fix/<issue>-<slug>         contoh: fix/34-meter-decrease
chore/<slug>               contoh: chore/ci-cache
docs/<slug>                contoh: docs/contract-freeze
```

Buat branch dari `main`. Rebase atau merge `main` bila branch berumur lebih dari satu hari. Hapus branch setelah merge.

## Commit

Gunakan Conventional Commits:

```text
feat: add guest progress claim endpoint
fix: reject duplicate meter reading
docs: freeze C1-C6 v0
test: add contract test for mission event
chore: configure lint and test scripts
```

Body commit menjelaskan **kenapa**, bukan sekadar apa yang berubah. Sertakan `Refs #<issue>` bila relevan.

## Pull request

Setiap PR wajib:

- [ ] Menyebut issue (`Closes #...` atau `Refs #...`).
- [ ] Menjelaskan perubahan dan risiko.
- [ ] Menyertakan langkah verifikasi yang sudah dijalankan.
- [ ] Lulus lint, typecheck, unit test, dan contract test yang relevan.
- [ ] Menambah/memperbarui test untuk perilaku baru.
- [ ] Memperbarui dokumentasi/kontrak bila perilaku publik berubah.
- [ ] Menyertakan screenshot/video untuk perubahan UI.
- [ ] Tidak menambah angka baru dari LLM, klaim real-time, atau rumus kWh/Rp di luar `energy-calc`.

Reviewer minimal satu orang dari area lain. Perubahan C1–C6 memerlukan persetujuan **Mahdi, Dhifansa, Muchsin, dan Yusri** (boleh async di issue/PR).

## Definition of Done

Sebuah item dianggap selesai bila:

1. Acceptance criteria di issue terpenuhi.
2. Test relevan ditambahkan dan lulus; tidak ada test yang di-skip tanpa alasan.
3. `lint`, `typecheck`, `build`, dan test suite relevan hijau di CI.
4. Tidak ada regresi pada alur yang sudah ada.
5. Error/empty/loading state ditangani untuk perubahan UI.
6. Aksesibilitas dasar: target sentuh memadai, kontras, label teks, tidak wajib suara.
7. Dokumentasi/kontrak/ADR diperbarui bila keputusan atau antarmuka berubah.
8. Tidak ada secret, data pribadi, atau file besar yang tidak perlu.
9. QA menandai lulus untuk item yang memengaruhi alur pengguna.

## Review checklist

- Apakah angka yang tampil berasal dari `energy-calc`?
- Apakah label **Simulasi**, **Estimasi**, **Contoh**, atau **Belum cukup data** ditampilkan dengan benar?
- Apakah entitlement diperiksa di server, bukan hanya disembunyikan di FE?
- Apakah akses data dibatasi `business_id` pengguna?
- Apakah kegagalan OCR/STT/AI punya jalur konfirmasi, retry, atau fallback manual?
- Apakah perubahan kontrak kompatibel ke belakang, atau perlu versi baru?
- Apakah klaim produk masih sesuai batas "analisis setelah input", bukan real-time?

## Perubahan kontrak

1. Buka issue `contract-change` dan jelaskan alasan + dampak.
2. Ubah `docs/CONTRACTS.md` dan skema/OpenAPI terkait dalam PR terpisah.
3. Tambahkan contract test/fixture untuk perilaku baru.
4. Minta persetujuan keempat pemilik area.
5. Bump versi kontrak/template. Jangan memutus data historis.

## Menjalankan pengecekan

Prasyarat: Node.js >=20.9 dan pnpm 10.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Contract test dan E2E ditambahkan pada issue #12 dan #9; setelah itu perintahnya:

```bash
pnpm test:contract
pnpm test:e2e
```

## Pelaporan bug

Gunakan template **Bug** dan sertakan langkah reproduksi, hasil yang diharapkan, hasil aktual, perangkat/browser, serta bukti (screenshot/log). Jangan menyertakan data pribadi pengguna.
