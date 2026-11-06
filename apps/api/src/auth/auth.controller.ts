/**
 * Auth controller - P2 OTP endpoints
 * Owner: Mahdi, Sprint: S2
 */

import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  OtpRequestPayload,
  OtpRequestResult,
  OtpVerifyPayload,
  OtpVerifyResult,
  GuestMergePayload,
  GuestMergeResult,
} from '@voltra/contracts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp-request')
  async requestOtp(@Body() payload: OtpRequestPayload): Promise<OtpRequestResult> {
    return this.authService.requestOtp(payload);
  }

  @Post('otp-verify')
  async verifyOtp(@Body() payload: OtpVerifyPayload): Promise<OtpVerifyResult> {
    return this.authService.verifyOtp(payload);
  }

  @Post('guest-merge')
  async mergeGuest(
    @Request() req: any,
    @Body() payload: GuestMergePayload,
  ): Promise<GuestMergeResult> {
    // ponytail: extract user_id dari JWT guard nanti, mock dulu
    const userId = req.user?.sub ?? 'usr_mock_current';
    return this.authService.mergeGuest(userId, payload);
  }
}
