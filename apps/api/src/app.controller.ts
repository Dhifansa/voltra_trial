import { Controller, Get } from '@nestjs/common';
import { CONTRACT_VERSION } from '@voltra/contracts';
import { ENGINE_VERSION } from '@voltra/energy-calc';

@Controller()
export class AppController {
  @Get('health')
  health(): {
    status: 'ok';
    service: 'voltra-api';
    contractVersion: string;
    engineVersion: string;
  } {
    return {
      status: 'ok',
      service: 'voltra-api',
      contractVersion: CONTRACT_VERSION,
      engineVersion: ENGINE_VERSION,
    };
  }
}
