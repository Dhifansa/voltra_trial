import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import type {
  AskRequest,
  AskResponse,
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
import type { AiConfig } from './ai-config';
import { AI_CONFIG } from './ai-config';
import { AiGatewayException } from './ai-gateway.exception';
import { MockAiService } from './mock-ai.service';

interface RequestWithId {
  requestId?: string;
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly ai: MockAiService,
    @Inject(AI_CONFIG) private readonly config: AiConfig,
  ) {}

  private assertMockMode(): void {
    if (this.config.mode !== 'mock') {
      throw new AiGatewayException(
        HttpStatus.BAD_GATEWAY,
        'PROVIDER_ERROR',
        'Adapter AI live/hybrid belum tersedia pada build ini. Gunakan AI_MODE=mock untuk pengembangan.',
        { mode: this.config.mode },
      );
    }
  }

  private requestId(request: RequestWithId): string {
    return request.requestId ?? 'r_missing';
  }

  private requireBody<T>(body: T | undefined, endpoint: string): T {
    if (body === undefined || body === null) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        `Body request ${endpoint} wajib diisi.`,
      );
    }
    return body;
  }

  @Post('ocr-meter')
  @HttpCode(HttpStatus.OK)
  ocrMeter(
    @Req() request: RequestWithId,
    @Headers('x-ai-scenario') scenario?: string,
  ): OcrMeterResponse {
    this.assertMockMode();
    return this.ai.ocrMeter(this.requestId(request), scenario);
  }

  @Post('ocr-label')
  @HttpCode(HttpStatus.OK)
  ocrLabel(
    @Req() request: RequestWithId,
    @Headers('x-ai-scenario') scenario?: string,
  ): OcrLabelResponse {
    this.assertMockMode();
    return this.ai.ocrLabel(this.requestId(request), scenario);
  }

  @Post('ocr-token')
  @HttpCode(HttpStatus.OK)
  ocrToken(
    @Req() request: RequestWithId,
    @Headers('x-ai-scenario') scenario?: string,
  ): OcrTokenResponse {
    this.assertMockMode();
    return this.ai.ocrToken(this.requestId(request), scenario);
  }

  @Post('stt-extract')
  @HttpCode(HttpStatus.OK)
  sttExtract(
    @Req() request: RequestWithId,
    @Body() body: SttExtractRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): SttExtractResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'stt-extract');
    return this.ai.sttExtract(this.requestId(request), input, scenario);
  }

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  estimate(
    @Req() request: RequestWithId,
    @Body() body: EstimateRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): EstimateResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'estimate');
    return this.ai.estimate(this.requestId(request), input, scenario);
  }

  @Post('recommend')
  @HttpCode(HttpStatus.OK)
  recommend(
    @Req() request: RequestWithId,
    @Body() body: RecommendRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): RecommendResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'recommend');
    return this.ai.recommend(this.requestId(request), input, scenario);
  }

  @Post('explain')
  @HttpCode(HttpStatus.OK)
  explain(
    @Req() request: RequestWithId,
    @Body() body: ExplainRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): ExplainResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'explain');
    return this.ai.explain(this.requestId(request), input, scenario);
  }

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  ask(
    @Req() request: RequestWithId,
    @Body() body: AskRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): AskResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'ask');
    return this.ai.ask(this.requestId(request), input, scenario);
  }
}
