# Test Datasets untuk D-OCR dan D-STT

Folder ini menyimpan dataset evaluasi untuk OCR meter (D-OCR) dan Speech-to-Text (D-STT) sesuai requirement Fase 0.

## Struktur

```
tests/datasets/
├── d-ocr/              # 50 foto meter untuk evaluasi OCR
│   ├── images/         # File gambar (.jpg, .png)
│   └── metadata.json   # Ground truth dan metadata
├── d-stt/              # 50 voice notes untuk evaluasi STT
│   ├── audio/          # File audio (.mp3, .wav, .m4a)
│   └── metadata.json   # Ground truth transcription
└── README.md           # File ini
```

## D-OCR: Foto Meter

### Cara menambahkan foto

1. Simpan foto di `tests/datasets/d-ocr/images/`
2. Naming: `meter-{nomor}.{ext}` (contoh: `meter-001.jpg`, `meter-042.png`)
3. Update `metadata.json` dengan ground truth angka kWh

### Format metadata.json

```json
{
  "version": "1.0.0",
  "created": "2026-11-06",
  "total": 50,
  "images": [
    {
      "id": "meter-001",
      "filename": "meter-001.jpg",
      "groundTruth": {
        "kwhValue": 12345.6,
        "unit": "kWh"
      },
      "metadata": {
        "source": "pilot-user-A",
        "meterType": "analog",
        "captureDate": "2026-11-05",
        "lighting": "good",
        "angle": "front",
        "notes": ""
      }
    }
  ]
}
```

### Variasi yang dibutuhkan (target 50 foto)

- **Tipe meter:** analog (jarum), digital (LED/LCD)
- **Lighting:** terang, redup, backlit, refleksi
- **Angle:** front, miring, jarak jauh
- **Kondisi:** bersih, kotor, tertutup sebagian
- **Sumber:** minimal 3 UMKM berbeda

## D-STT: Voice Notes

### Cara menambahkan voice notes

1. Simpan audio di `tests/datasets/d-stt/audio/`
2. Naming: `voice-{nomor}.{ext}` (contoh: `voice-001.mp3`)
3. Update `metadata.json` dengan ground truth transcription

### Format metadata.json

```json
{
  "version": "1.0.0",
  "created": "2026-11-06",
  "total": 50,
  "audio": [
    {
      "id": "voice-001",
      "filename": "voice-001.mp3",
      "groundTruth": {
        "transcription": "AC nyala delapan jam hari ini",
        "normalized": "ac nyala 8 jam hari ini"
      },
      "metadata": {
        "speaker": "pilot-user-A",
        "duration": 3.5,
        "language": "id",
        "accent": "jawa",
        "noiseLevel": "medium",
        "context": "warung-makan-siang",
        "keywords": ["ac", "8", "jam"],
        "notes": "background noise dari kompor"
      }
    }
  ]
}
```

### Variasi yang dibutuhkan (target 50 voice)

- **Logat:** Jawa, Jakarta, campuran
- **Kebisingan:** clean, medium (warung ramai), heavy (mesin cuci/kipas)
- **Durasi:** 2-10 detik (natural voice notes)
- **Konten:** nama alat, durasi/angka, lokasi, keluhan
- **Speaker:** minimal 5 orang berbeda

## Keyword Expected

Voice notes harus contain at least one dari:

**Alat:** AC, kulkas, freezer, mesin cuci, setrika, kompor, lampu, kipas, pompa, TV, sound system

**Durasi/Angka:** numerik (8, delapan) + unit (jam, menit, hari, kali)

**Context:** nyala, mati, rusak, panas, boros, hemat

## Git LFS (Opsional)

Jika total file >100MB, setup Git LFS:

```bash
git lfs install
git lfs track "tests/datasets/d-ocr/images/**"
git lfs track "tests/datasets/d-stt/audio/**"
git add .gitattributes
```

## Evaluation Script (TODO)

Script evaluasi akan ditambahkan di `tests/datasets/evaluate-*.ts`:

- `evaluate-ocr.ts` - WER, accuracy angka kWh
- `evaluate-stt.ts` - WER, keyword accuracy, latency

## Owner

Dataset dikumpulkan dan dikelola oleh **Yusri** (QA/E2E Engineer).

Pertanyaan atau usulan perubahan format: buka issue dengan label `qa` atau `dataset`.
