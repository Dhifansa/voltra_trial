/**
 * Business controller - P3 endpoints
 * Owner: Mahdi, Sprint: S2
 */

import { Controller, Get, Post, Patch, Body, Param, Request } from '@nestjs/common';
import { BusinessService } from './business.service';
import type { BusinessProfilePayload, BusinessProfile } from '@voltra/contracts';

interface RequestWithUser {
  user?: {
    sub?: string;
  };
}

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('profile')
  async createProfile(
    @Request() req: RequestWithUser,
    @Body() payload: BusinessProfilePayload,
  ): Promise<BusinessProfile> {
    // ponytail: extract user_id dari JWT guard nanti, mock dulu
    const userId = req.user?.sub ?? 'usr_mock_current';
    return this.businessService.createProfile(userId, payload);
  }

  @Get('profile')
  async getMyProfile(@Request() req: RequestWithUser): Promise<BusinessProfile | null> {
    const userId = req.user?.sub ?? 'usr_mock_current';
    return this.businessService.getProfileByUser(userId);
  }

  @Get('profile/:id')
  async getProfile(
    @Param('id') businessId: string,
    @Request() req: RequestWithUser,
  ): Promise<BusinessProfile | null> {
    const userId = req.user?.sub ?? 'usr_mock_current';
    return this.businessService.getProfile(businessId, userId);
  }

  @Patch('profile/:id')
  async updateProfile(
    @Param('id') businessId: string,
    @Request() req: RequestWithUser,
    @Body() updates: Partial<BusinessProfilePayload>,
  ): Promise<BusinessProfile> {
    const userId = req.user?.sub ?? 'usr_mock_current';
    return this.businessService.updateProfile(businessId, userId, updates);
  }
}
