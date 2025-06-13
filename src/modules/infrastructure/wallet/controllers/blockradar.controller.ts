import { Body, Controller, Post } from '@nestjs/common';
import { BlockradarService } from '../services';

@Controller('blockradar')
export class BlockradarController {
  constructor(private readonly blockradarService: BlockradarService) {}

  @Post('webhook')
  async webhook(@Body() body: any) {
    // return this.blockradarService.handleWebhook(body);
  }
}
