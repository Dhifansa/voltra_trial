import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ErrorCode } from '@voltra/contracts';
import { AiGatewayException } from './ai-gateway.exception';

function codeForStatus(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'VALIDATION_ERROR';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'INSUFFICIENT_DATA';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    default:
      return 'PROVIDER_ERROR';
  }
}

function messageFor(exception: unknown): string {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const message = response.message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join('; ');
    }
  }
  return 'Terjadi kesalahan pada AI Gateway.';
}

@Catch()
export class AiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId =
      typeof request.requestId === 'string' ? request.requestId : `r_${randomUUID()}`;

    const body =
      exception instanceof AiGatewayException
        ? {
            error: {
              code: exception.code,
              message: exception.message,
              request_id: requestId,
              ...(exception.details ? { details: exception.details } : {}),
            },
          }
        : {
            error: {
              code: codeForStatus(status),
              message: messageFor(exception),
              request_id: requestId,
            },
          };

    response.status(status).json(body);
  }
}
