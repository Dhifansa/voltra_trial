import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { AiController } from './ai/ai.controller';
import { AiModule } from './ai/ai.module';
import { RequestIdMiddleware } from './ai/request-id.middleware';
import { AppController } from './app.controller';

@Module({
  imports: [AiModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes(AiController, AppController);
  }
}
