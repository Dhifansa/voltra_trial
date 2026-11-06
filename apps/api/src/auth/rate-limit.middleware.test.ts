/**
 * Rate limit middleware test
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitMiddleware } from './rate-limit.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new RateLimitMiddleware();
    req = { ip: '127.0.0.1', path: '/auth/otp-request' };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('allows first 10 requests within 15 minutes', () => {
    for (let i = 0; i < 10; i++) {
      middleware.use(req as Request, res as Response, next);
    }
    expect(next).toHaveBeenCalledTimes(10);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks 11th request within 15 minutes', () => {
    for (let i = 0; i < 10; i++) {
      middleware.use(req as Request, res as Response, next);
    }
    middleware.use(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(10);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'RATE_LIMITED',
        }),
      })
    );
  });

  it('resets after 15 minutes', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 10; i++) {
      middleware.use(req as Request, res as Response, next);
    }

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    middleware.use(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(11);
    vi.useRealTimers();
  });

  it('isolates different IPs', () => {
    const req2 = { ...req, ip: '192.168.1.1' };

    for (let i = 0; i < 10; i++) {
      middleware.use(req as Request, res as Response, next);
    }
    middleware.use(req2 as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(11);
  });
});
