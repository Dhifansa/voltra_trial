/**
 * Rate limit middleware untuk auth endpoints
 * Owner: Mahdi, Sprint: S2
 * 
 * Limit: 10 request per 15 menit per IP.
 * ponytail: in-memory, Redis nanti bila >1 instance.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorBody } from '@voltra/contracts';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly limits = new Map<string, RateLimitEntry>();
  private readonly MAX_REQUESTS = 10;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 menit

  use(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip ?? 'unknown';
    const now = Date.now();

    let entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.WINDOW_MS };
      this.limits.set(key, entry);
    }

    entry.count++;

    if (entry.count > this.MAX_REQUESTS) {
      const error: ApiErrorBody = {
        error: {
          code: 'RATE_LIMITED',
          message: `Too many requests. Try again in ${Math.ceil((entry.resetAt - now) / 1000)} seconds.`,
          request_id: 'rate_limit',
        },
      };
      res.status(429).json(error);
      return;
    }

    next();
  }
}
