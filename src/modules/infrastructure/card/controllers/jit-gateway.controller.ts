import { ApiExcludeController } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { JitGatewayService } from '../services';
import { JitGatewayEventDto } from '../dtos';
import { PinoLogger } from 'nestjs-pino';
import { Response } from 'express';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
  Res,
} from '@nestjs/common';

@Controller('sudo')
@ApiExcludeController()
export class JitGatewayController {
  constructor(
    private readonly jitGatewayService: JitGatewayService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(JitGatewayController.name);
  }

  @Post('jitgateway')
  @HttpCode(HttpStatus.OK)
  async handleJitGatewayWebhook(
    @Body() body: any,
    @Headers('authorization') authHeader: string,
    @Res() res: Response,
  ) {
    this.logger.info(
      `Sudo JIT Gateway: Handling webhook: ${JSON.stringify(body, null, 2)}, ${authHeader}`,
    );

    const isValid = await this.jitGatewayService.validateSignature(authHeader);

    if (!isValid) {
      this.logger.fatal(`Sudo JIT Gateway: Signature mismatch: ${authHeader}`);
      throw new BadRequestException('Signature mismatch');
    }

    const dto = plainToInstance(JitGatewayEventDto, body);

    try {
      await validateOrReject(dto);
    } catch (error) {
      this.logger.error(`Sudo JIT Gateway: DTO validation error: ${error}`);
      throw new BadRequestException('Invalid webhook payload');
    }

    this.logger.info(`Sudo JIT Gateway: Validated webhook: ${dto.type}, ${dto._id}`);

    const response = await this.jitGatewayService.handleJitGatewayEvent(dto);

    res.status(HttpStatus.OK).json(response);
  }
}
