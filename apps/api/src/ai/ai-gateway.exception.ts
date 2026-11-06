import { HttpException, HttpStatus } from '@nestjs/common';
import type { ErrorCode } from '@voltra/contracts';

/** Error yang selalu dipetakan ke bentuk C3 oleh AiExceptionFilter. */
export class AiGatewayException extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message, status);
  }
}
