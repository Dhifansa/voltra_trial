/**
 * Business service - CRUD profil usaha
 * Owner: Mahdi, Sprint: S2
 */

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import type {
  BusinessProfilePayload,
  BusinessProfile,
} from '@voltra/contracts';

@Injectable()
export class BusinessService {
  private readonly profiles = new Map<string, BusinessProfile>(); // ponytail: in-memory, DB nanti
  private readonly userBusinessMap = new Map<string, string>(); // user_id -> business_id

  async createProfile(
    userId: string,
    payload: BusinessProfilePayload,
  ): Promise<BusinessProfile> {
    const businessId = `biz_mock_${Date.now()}`;
    const now = new Date().toISOString();

    const profile: BusinessProfile = {
      business_id: businessId,
      user_id: userId,
      business_name: payload.business_name,
      template_id: payload.template_id,
      electricity_rate: payload.electricity_rate,
      billing_type: payload.billing_type,
      unit_label: payload.unit_label ?? 'unit',
      address: payload.address,
      notes: payload.notes,
      created_at: now,
      updated_at: now,
    };

    this.profiles.set(businessId, profile);
    this.userBusinessMap.set(userId, businessId);

    return profile;
  }

  async getProfile(businessId: string, userId: string): Promise<BusinessProfile | null> {
    const profile = this.profiles.get(businessId);

    if (!profile) {
      return null;
    }

    // Authz: hanya pemilik
    if (profile.user_id !== userId) {
      return null;
    }

    return profile;
  }

  async updateProfile(
    businessId: string,
    userId: string,
    updates: Partial<BusinessProfilePayload>,
  ): Promise<BusinessProfile> {
    const profile = this.profiles.get(businessId);

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    // Authz: hanya pemilik
    if (profile.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this profile');
    }

    const updated: BusinessProfile = {
      ...profile,
      ...updates,
      business_id: profile.business_id, // immutable
      user_id: profile.user_id, // immutable
      created_at: profile.created_at, // immutable
      updated_at: new Date().toISOString(),
    };

    this.profiles.set(businessId, updated);

    return updated;
  }

  async getProfileByUser(userId: string): Promise<BusinessProfile | null> {
    const businessId = this.userBusinessMap.get(userId);

    if (!businessId) {
      return null;
    }

    return this.profiles.get(businessId) ?? null;
  }
}
