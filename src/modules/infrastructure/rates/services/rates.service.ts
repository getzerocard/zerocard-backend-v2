import { CacheService } from '@/infrastructure';
import { PaycrestProvider } from '../providers';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RatesService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly paycrestProvider: PaycrestProvider,
    private readonly cacheService: CacheService,
  ) {
    this.logger.setContext(RatesService.name);
  }

  async getRates(token: string) {
    const cachedRates = await this.cacheService.get(`rates:${token}`);
    if (cachedRates) {
      return cachedRates;
    }

    const rates = await this.paycrestProvider.getRates(token);
    if (rates.status === 'success') {
      const ttl = 60 * 5; // 5 minutes
      await this.cacheService.set(`rates:${token}`, rates.data, ttl);
    }
    return rates;
  }
}
