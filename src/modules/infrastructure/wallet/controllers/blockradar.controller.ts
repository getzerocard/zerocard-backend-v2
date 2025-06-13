import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { BlockradarWebhookEventDto } from '../dtos';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { BlockradarWebhookService } from '../services';
import { PinoLogger } from 'nestjs-pino';

@Controller('blockradar')
export class BlockradarController {
  constructor(
    private readonly webhookService: BlockradarWebhookService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BlockradarController.name);
  }

  @Post('webhook')
  async webhook(@Body() body: any, @Headers('x-blockradar-signature') signature: string) {
    this.logger.info(`Received blockradar webhook: ${JSON.stringify(body)}`);

    const isValid = await this.webhookService.validateSignature(body, signature);

    if (!isValid) {
      this.logger.warn('Invalid signature on blockradar webhook', { body, signature });
      throw new UnauthorizedException('Invalid signature');
    }

    const dto = plainToInstance(BlockradarWebhookEventDto, body);
    await validateOrReject(dto);

    await this.webhookService.handleWebhook(dto);
  }
}
