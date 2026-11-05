## Ringkasan

<!-- Apa yang berubah dan mengapa? -->

## Issue

Closes #

## Jenis perubahan

- [ ] Fitur
- [ ] Perbaikan bug
- [ ] Refactor
- [ ] Test
- [ ] Dokumentasi/kontrak
- [ ] Infra/CI

## Verifikasi

<!-- Perintah dan hasilnya; sertakan screenshot/video untuk UI. -->

- [ ] Lint
- [ ] Typecheck
- [ ] Unit test
- [ ] Contract test (bila C1–C6 berubah)
- [ ] E2E (bila alur pengguna berubah)
- [ ] Manual check: ...

## Checklist

- [ ] Acceptance criteria issue terpenuhi.
- [ ] Angka kWh/Rp berasal dari `energy-calc`; tidak ada rumus baru di FE/laporan.
- [ ] Tidak ada angka baru dari LLM; validator/fallback diuji.
- [ ] Label **Simulasi/Estimasi/Contoh/Belum cukup data** ditampilkan dengan benar.
- [ ] Tidak menambah klaim real-time tanpa sensor/AMI.
- [ ] Entitlement diperiksa di server; akses dibatasi `business_id`.
- [ ] Tidak ada secret/data pribadi di diff.
- [ ] Dokumentasi/kontrak/ADR diperbarui bila perlu.
- [ ] QA sudah menandai lulus (untuk alur pengguna).

## Risiko dan rollback

<!-- Risiko, feature flag, atau langkah rollback bila ada. -->
