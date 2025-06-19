import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';

@Injectable()
export class asssetIdService {
  constructor(private readonly database: PrismaService) {}

  async getAssetId(asset: string, chain: string) {
    return this.database.assetId.findUnique({
      where: { asset, chain },
    });
  }
}
