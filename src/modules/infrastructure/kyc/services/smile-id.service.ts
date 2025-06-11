import { Injectable } from '@nestjs/common';
import { SmileIdProvider } from '../providers';

@Injectable()
export class SmileIdService {
  constructor(private readonly smileIdProvider: SmileIdProvider) {}
}
