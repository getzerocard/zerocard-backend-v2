import { Controller } from '@nestjs/common';
import { BlockradarService } from '../services';

@Controller()
export class BlockradarController {
  constructor(private readonly blockradarService: BlockradarService) {}
}
