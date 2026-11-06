import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface RequestWithId {
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
}

interface ResponseWithHeaders {
  setHeader(name: string, value: string): void;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithId, response: ResponseWithHeaders, next: () => void): void {
    const incoming = request.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && incoming.trim().length > 0
        ? incoming
        : `r_${randomUUID()}`;

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  }
}
