import { Controller } from '@nestjs/common';
import { SmileIdService } from '../services';

@Controller()
export class SmileIdController {
  constructor(private readonly smileIdService: SmileIdService) {}
}
