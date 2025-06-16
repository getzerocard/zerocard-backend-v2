import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { JitGatewayService } from '../services';
import { PinoLogger } from 'nestjs-pino';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AuthorizationRequestDto } from '../dtos';

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
  async handleAuthorizationRequest(
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const isValid = await this.jitGatewayService.validateSignature(authHeader);

    if (!isValid) {
      this.logger.fatal('Sudo JIT Gateway: Signature mismatch', { body, authHeader });
      throw new BadRequestException('Signature mismatch');
    }

    const dto = plainToInstance(AuthorizationRequestDto, body);
    await validateOrReject(dto);

    await this.jitGatewayService.handleAuthorizationRequest(dto);
  }
}
