import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Root controller; with global prefix 'api' set in main.ts, GET /api maps here.
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
