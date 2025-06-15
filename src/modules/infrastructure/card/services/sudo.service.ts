import { CreateCardParams, CreateCustomerParams } from '../types';
import { Injectable } from '@nestjs/common';
import { SudoProvider } from '../providers';

@Injectable()
export class SudoService {
  constructor(private readonly provider: SudoProvider) {}

  async createCustomer(params: CreateCustomerParams) {
    // return this.provider.createCustomer(params);
  }

  async createCard(params: CreateCardParams) {
    // return this.provider.createCard(params);
  }
}
