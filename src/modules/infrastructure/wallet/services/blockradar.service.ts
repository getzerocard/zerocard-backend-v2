import { Injectable } from '@nestjs/common';
import { BlockradarProvider } from '../providers';

@Injectable()
export class BlockradarService {
  constructor(private readonly blockradarProvider: BlockradarProvider) {}
}
