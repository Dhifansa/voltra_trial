/**
 * Auth module - OTP, session, guest merge
 * Owner: Mahdi, Sprint: S2
 */

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpMockAdapter } from './adapters/otp-mock.adapter';

@Module({
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
export class AuthModule {}
