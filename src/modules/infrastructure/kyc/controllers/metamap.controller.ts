import { Body, Controller, Post } from '@nestjs/common';
import { MetaMapService } from '../services';

@Controller('metamap')
export class MetaMapController {
  constructor(private readonly metamapService: MetaMapService) {}

  @Post('webhook')
  async handleMetaMapWebhook(@Body() body: any) {}
}
