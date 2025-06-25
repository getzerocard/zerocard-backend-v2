import { ApiExcludeController } from '@nestjs/swagger';
import { BlockradarWebhookService } from '../services';
import { BlockradarWebhookEventDto } from '../dtos';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

@Controller('blockradar')
@ApiExcludeController()
export class BlockradarController {
  constructor(
    private readonly webhookService: BlockradarWebhookService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BlockradarController.name);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: any, @Headers('x-blockradar-signature') signature: string) {
    this.logger.info(`Received blockradar webhook: ${JSON.stringify(body)}`);

    const isValid = await this.webhookService.validateSignature(body, signature);

    if (!isValid) {
      this.logger.fatal('Invalid signature on blockradar webhook', { body, signature });
      throw new BadRequestException('Invalid signature');
    }

    const dto = plainToInstance(BlockradarWebhookEventDto, body);
    await validateOrReject(dto);

    await this.webhookService.handleWebhook(dto);
  }
}
