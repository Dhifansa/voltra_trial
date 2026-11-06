import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AI_CONFIG, resolveAiConfig } from './ai-config';
import { AiController } from './ai.controller';
import { AiExceptionFilter } from './ai-exception.filter';
import { MockAiService } from './mock-ai.service';

@Module({
  controllers: [AiController],
  providers: [
    MockAiService,
    {
      provide: AI_CONFIG,
      useFactory: () => resolveAiConfig(),
    },
    {
      provide: APP_FILTER,
      useClass: AiExceptionFilter,
    },
  ],
})
export class AiModule {}
