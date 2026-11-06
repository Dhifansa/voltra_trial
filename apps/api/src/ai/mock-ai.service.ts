import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type {
  AiEnvelope,
  AskRequest,
  AskResponse,
  Confidence,
  EstimateRequest,
  EstimateResponse,
  ExplainRequest,
  ExplainResponse,
  OcrLabelResponse,
  OcrMeterResponse,
  OcrTokenResponse,
  RecommendRequest,
  RecommendResponse,
  SttExtractRequest,
  SttExtractResponse,
} from '@voltra/contracts';
import type { AiConfig, AiScenario } from './ai-config';
import { AI_CONFIG, isAiScenario } from './ai-config';
import { AiGatewayException } from './ai-gateway.exception';

const MOCK_WINDOW = {
  from: '2026-12-01T06:00:00+07:00',
  to: '2026-12-02T06:00:00+07:00',
};

@Injectable()
export class MockAiService {
  constructor(@Inject(AI_CONFIG) private readonly config: AiConfig) {}

  private resolveScenario(requested?: string): AiScenario {
    if (requested === undefined || requested.length === 0) {
      return this.config.defaultScenario;
    }
    if (!this.config.allowScenarioOverride) {
      throw new AiGatewayException(
        HttpStatus.FORBIDDEN,
        'FORBIDDEN',
        'Pemaksaan skenario hanya tersedia pada mode mock di lingkungan pengembangan.',
      );
    }
    if (!isAiScenario(requested)) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        `Skenario tidak dikenal: "${requested}".`,
        { allowed: ['success', 'low_confidence', 'insufficient_data', 'provider_error'] },
      );
    }
    return requested;
  }

  private assertScenario(
    scenario: AiScenario,
    pipeline: string,
  ): asserts scenario is 'success' | 'low_confidence' {
    if (scenario === 'provider_error') {
      throw new AiGatewayException(
        HttpStatus.BAD_GATEWAY,
        'PROVIDER_ERROR',
        'Penyedia AI sedang tidak tersedia. Coba lagi atau masukkan data manual.',
        { pipeline, provider: 'mock', retryable: true },
      );
    }
    if (scenario === 'insufficient_data') {
      throw new AiGatewayException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'INSUFFICIENT_DATA',
        'Data belum cukup untuk pipeline ini. Tambahkan data lalu coba lagi.',
        { pipeline, data_days: 1, min_data_days: 3 },
      );
    }
  }

  private envelope(
    requestId: string,
    pipeline: string,
    confidence: Confidence,
    warnings: string[] = [],
  ): AiEnvelope {
    return {
      request_id: requestId,
      engine_version: `mock-${pipeline}-0.1.0`,
      mode: 'mock',
      confidence,
      warnings,
    };
  }

  ocrMeter(requestId: string, scenarioInput?: string): OcrMeterResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'ocr-meter');
    const low = scenario === 'low_confidence';

    return {
      ...this.envelope(
        requestId,
        'ocr-meter',
        low ? 'low' : 'high',
        low ? ['decimal_digit_uncertain', 'glare_detected'] : [],
      ),
      kwh: low ? 12345.0 : 12345.6,
      unit: 'kWh',
      digits_confidence: low
        ? [0.99, 0.97, 0.98, 0.95, 0.9, 0.62]
        : [0.99, 0.97, 0.98, 0.95, 0.9, 0.88],
      needs_retake: low,
      bbox: [120, 240, 480, 360],
    };
  }

  ocrLabel(requestId: string, scenarioInput?: string): OcrLabelResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'ocr-label');
    const low = scenario === 'low_confidence';

    return {
      ...this.envelope(
        requestId,
        'ocr-label',
        low ? 'low' : 'medium',
        low ? ['label_partially_visible'] : [],
      ),
      name: 'Pengering',
      power_w: 3000,
      brand: 'Contoh',
      needs_retake: low,
    };
  }

  ocrToken(requestId: string, scenarioInput?: string): OcrTokenResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'ocr-token');
    const low = scenario === 'low_confidence';

    return {
      ...this.envelope(
        requestId,
        'ocr-token',
        low ? 'low' : 'medium',
        low ? ['receipt_amount_unclear'] : [],
      ),
      date: '2026-12-01',
      amount_rp: 100000,
      kwh: low ? null : 68.9,
      remaining_kwh: low ? null : 12.4,
      needs_retake: low,
    };
  }

  sttExtract(
    requestId: string,
    input: SttExtractRequest,
    scenarioInput?: string,
  ): SttExtractResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'stt-extract');
    const low = scenario === 'low_confidence';
    const appliances =
      input.appliances.length > 0
        ? input.appliances
        : [
            { id: 'dryer', name: 'Pengering' },
            { id: 'iron', name: 'Setrika' },
          ];

    return {
      ...this.envelope(
        requestId,
        'stt-extract',
        low ? 'low' : 'medium',
        low ? ['stt_low_confidence'] : [],
      ),
      transcript: low
        ? 'Pengering nyala kira-kira lima jam, setrika dua jam, mesin es juga.'
        : 'Pengering nyala lima jam dan setrika dua jam.',
      entries: appliances.slice(0, 2).map((appliance, index) => ({
        appliance_id: appliance.id,
        hours: index === 0 ? 5 : 2,
        from: index === 0 ? '09:00' : '14:00',
        to: index === 0 ? '14:00' : '16:00',
        conf: low ? 0.55 : index === 0 ? 0.92 : 0.88,
      })),
      work_volume: null,
      confirm_text: 'Periksa kembali jam alat sebelum menyimpan.',
      unmatched_terms: low ? ['mesin es'] : [],
    };
  }

  estimate(
    requestId: string,
    input: EstimateRequest,
    scenarioInput?: string,
  ): EstimateResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'estimate');
    const low = scenario === 'low_confidence';
    const window = input.window ?? MOCK_WINDOW;

    return {
      ...this.envelope(
        requestId,
        'estimate',
        low ? 'low' : 'high',
        low ? ['mock_scenario_low_confidence'] : [],
      ),
      window,
      meter_delta_kwh: low ? 28 : 12,
      per_appliance: [
        {
          appliance_id: input.appliances[0]?.appliance_id ?? 'dryer',
          kwh: 10.5,
          basis: { power_kw: 3, hours: 5, load_factor: 0.7 },
          confidence: low ? 'low' : 'high',
        },
      ],
      explained_kwh: 10.5,
      unexplained_kwh: low ? 17.5 : 1.5,
      gap_ratio: low ? 0.625 : 0.125,
      overall_confidence: low ? 'low' : 'high',
      display_level: low ? 'category' : 'appliance',
      ...(low
        ? {
            next_questions: ['Alat lain apa yang menyala hari ini?'],
            suggested_missions: ['M1', 'M4'],
          }
        : {}),
      engine_version: `mock-estimate-0.1.0`,
    };
  }

  recommend(
    requestId: string,
    _input: RecommendRequest,
    scenarioInput?: string,
  ): RecommendResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'recommend');
    const low = scenario === 'low_confidence';

    return {
      ...this.envelope(
        requestId,
        'recommend',
        low ? 'low' : 'medium',
        low ? ['low_confidence_suggestion'] : [],
      ),
      recommendations: low
        ? [
            {
              action_id: 'full_load_dryer',
              title: 'Isi pengering penuh sebelum menyala',
              est_saving_kwh: { min: 10, max: 40 },
              est_saving_rp: { min: 15000, max: 60000 },
              confidence: 'low',
              effort: 'low',
              score: 0.3,
              safety_note: 'Jangan melebihi kapasitas mesin.',
            },
          ]
        : [
            {
              action_id: 'full_load_dryer',
              title: 'Isi pengering penuh sebelum menyala',
              est_saving_kwh: { min: 18, max: 34 },
              est_saving_rp: { min: 27000, max: 51000 },
              confidence: 'medium',
              effort: 'low',
              score: 0.62,
              safety_note: 'Jangan melebihi kapasitas mesin.',
            },
            {
              action_id: 'shift_dryer_hours',
              title: 'Geser sebagian jam pengering ke luar jam sibuk',
              est_saving_kwh: { min: 5, max: 9 },
              est_saving_rp: { min: 7500, max: 13500 },
              confidence: 'medium',
              effort: 'medium',
              score: 0.41,
            },
          ],
    };
  }

  explain(
    requestId: string,
    _input: ExplainRequest,
    scenarioInput?: string,
  ): ExplainResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'explain');
    const low = scenario === 'low_confidence';

    return {
      ...this.envelope(
        requestId,
        'explain',
        low ? 'low' : 'high',
        low ? ['low_confidence_fallback'] : [],
      ),
      text: low
        ? 'Data belum cukup untuk menjelaskan rincian. Lengkapi catatan jam pemakaian agar penjelasan lebih akurat.'
        : 'Pengering adalah penyumbang pemakaian terbesar pada periode ini. Rincian angka ada pada hasil estimasi yang menjadi dasar penjelasan ini.',
      numbers_used: [],
      fallback_used: low,
    };
  }

  ask(requestId: string, _input: AskRequest, scenarioInput?: string): AskResponse {
    const scenario = this.resolveScenario(scenarioInput);
    this.assertScenario(scenario, 'ask');
    const low = scenario === 'low_confidence';

    return {
      ...this.envelope(
        requestId,
        'ask',
        low ? 'low' : 'medium',
        low ? ['low_confidence_answer'] : [],
      ),
      answer: low
        ? 'Belum cukup data untuk menjawab dengan yakin. Coba lengkapi catatan jam pemakaian atau foto meter.'
        : 'Berdasarkan data yang tersedia, pemakaian terbesar berasal dari pengering. Untuk angka rinci, buka hasil estimasi pada periode terkait.',
      sources: low ? [] : [{ type: 'estimate', id: 'est_mock' }],
      disclaimer:
        'Jawaban memakai data contoh dan bukan jaminan penghematan. Keputusan tetap milik pemilik usaha.',
      followup_mission: low ? 'M2' : 'M3',
    };
  }
}
