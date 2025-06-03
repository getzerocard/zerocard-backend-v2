import { Injectable } from '@nestjs/common';
import { PrivyClient } from '@privy-io/server-auth';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PrivyService {

  private readonly privyClient: PrivyClient;

  constructor(private readonly logger: PinoLogger, private readonly configService: ConfigService) {
    this.logger.setContext(PrivyService.name);
    this.privyClient = new PrivyClient(
      this.configService.get<string>('PRIVY_API_KEY'),
      this.configService.get<string>('PRIVY_API_SECRET'),
      {
        walletApi: {
          authorizationPrivateKey: this.configService.get<string>('PRIVY_AUTHORIZATION_PRIVATE_KEY'),
        }
      }
    );
  }
}
