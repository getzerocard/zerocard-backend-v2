import { ApiExcludeController } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AuthorizationRequestDto } from '../dtos';
import { JitGatewayService } from '../services';
import { PinoLogger } from 'nestjs-pino';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
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
  async handleAuthorizationRequest(
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    console.log(JSON.stringify(body, null, 2));
    console.log(authHeader);

    return;

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
