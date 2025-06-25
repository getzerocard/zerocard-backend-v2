import { MetaMapProvider } from '../providers';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaMapService {
  constructor(private readonly metamapProvider: MetaMapProvider) {}
}
