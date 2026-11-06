/**
 * Auth module - OTP, session, guest merge
 * Owner: Mahdi, Sprint: S2
 */

import { Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpMockAdapter } from './adapters/otp-mock.adapter';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SESSION_SECRET ?? 'dev-secret-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'OTP_ADAPTER',
      useClass: OtpMockAdapter,
    },
    {
      provide: OtpMockAdapter,
      useClass: OtpMockAdapter,
    },
  ],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes(AuthController);
  }
}
