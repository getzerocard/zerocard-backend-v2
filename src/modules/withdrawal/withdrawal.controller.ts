import { Logger, Post, UseGuards, Get, Query, ValidationPipe, Body, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiExtraModels,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { WithdrawalService } from './cryptoWithdrawal.service';
import { BalanceService } from './balance.service';
import { PrivyAuthGuard } from '../../common/guards';
import { PrivyUser } from '../auth/decorators/privy-user.decorator';
import { PrivyUserData } from '../auth/interfaces/privy-user.interface';
import {
  WithdrawalQueryDto,
  WithdrawalResponseDataDto,
  ProcessWithdrawalErrorResponses,
  TokenBalanceResponseDto,
  GetBalanceErrorResponses,
} from './dto/withdrawal.dto';
import { ApiController } from '../../common/decorators/api-controller.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-response.decorator';
import { Response } from '../../common/interceptors/response.interceptor';
import { FiatWithdrawalDto, FiatWithdrawalResponseDto, FiatWithdrawalErrorResponses } from './dto/fiat-withdrawal.dto';
import { BankListResponseDto, GetBankListErrorResponses } from './dto/bank-list.dto';
import { FiatWithdrawalService } from './fiatwithdrwal.service';
import { VerifyAccountDto, VerifyAccountResponseDataDto, VerifyAccountErrorResponses } from './dto/verify-account.dto';
import { TokenRateResponseDto, TokenRateErrorResponses } from './dto/token-rate.dto';


/**
 * Controller for managing cryptocurrency withdrawals
 */

@ApiController('withdrawal', 'Withdrawal')
@ApiBearerAuth()
@ApiSecurity('identity-token')
@UseGuards(PrivyAuthGuard)
@ApiExtraModels(
  Response,
  WithdrawalQueryDto,
  WithdrawalResponseDataDto,
  TokenBalanceResponseDto,
  FiatWithdrawalDto,
  FiatWithdrawalResponseDto,
  BankListResponseDto,
  VerifyAccountDto,
  VerifyAccountResponseDataDto,
)
export class WithdrawalController {
  private readonly logger = new Logger(WithdrawalController.name);

  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly balanceService: BalanceService,
    private readonly fiatWithdrawalService: FiatWithdrawalService
  ) { }

  /**
   * Process a cryptocurrency withdrawal for the authenticated user.
   * Parameters are provided via query string.
   * @param query The validated query parameters for the withdrawal request.
   * @param userData The authenticated user's data.
   * @returns Object containing the transaction details of the withdrawal.
   */
  @Post('process/me')
  @ApiOperation({
    summary: 'Process cryptocurrency withdrawal for authenticated user',
    description:
      'Initiate a cryptocurrency withdrawal for the authenticated user using query parameters.',
  })
  @ApiQuery({ name: 'tokenSymbol', type: String, required: true, example: 'USDC' })
  @ApiQuery({ name: 'amount', type: String, required: true, example: '50.25' })
  @ApiQuery({
    name: 'recipientAddress',
    type: String,
    required: true,
    example: '0x123...',
  })
  @ApiQuery({
    name: 'chainType',
    enum: ['ethereum', 'solana'],
    required: true,
    example: 'ethereum',
  })
  @ApiQuery({
    name: 'blockchainNetwork',
    type: String,
    required: false,
    description: 'Optional specific network (e.g., Base Sepolia). Leave empty or omit for default.',
    example: 'Base Sepolia',
  })
  @ApiStandardResponse(WithdrawalResponseDataDto, 'Withdrawal processed successfully')
  @ApiResponse(ProcessWithdrawalErrorResponses.R400_INVALID)
  @ApiResponse(ProcessWithdrawalErrorResponses.R400_INSUFFICIENT_BALANCE)
  @ApiResponse(ProcessWithdrawalErrorResponses.R400_WALLET_NOT_FOUND)
  @ApiResponse(ProcessWithdrawalErrorResponses.R400_CONFIG_ERROR)
  @ApiResponse(ProcessWithdrawalErrorResponses.R401_UNAUTHORIZED)
  @ApiResponse(ProcessWithdrawalErrorResponses.R404_USER_NOT_FOUND)
  @ApiResponse(ProcessWithdrawalErrorResponses.R500)
  async processWithdrawal(
    @Query(new ValidationPipe({ transform: true })) query: WithdrawalQueryDto,
    @PrivyUser() userData: PrivyUserData,
  ): Promise<WithdrawalResponseDataDto> {
    const targetUserId = userData.userId;
    this.logger.log(
      `Processing withdrawal request via query for user ${targetUserId} with params: ${JSON.stringify(query)}`,
    );

    const result = await this.withdrawalService.processWithdrawal(
      targetUserId,
      query.tokenSymbol,
      query.amount,
      query.recipientAddress,
      query.chainType,
      query.blockchainNetwork,
    );
    return result;
  }

  /**
   * Get token balances for the authenticated user
   * @param userData The authenticated user's data
   * @param symbols The token symbols to check balances for (comma-separated)
   * @param chainType The blockchain type (ethereum or solana)
   * @param blockchainNetwork The specific blockchain network(s) to check (optional)
   * @returns Object containing balances for the specified tokens on the given networks
   */
  @Get('balance')
  @ApiOperation({
    summary: 'Get token balances',
    description: 'Fetch token balances for the authenticated user across specified blockchain networks',
  })
  @ApiQuery({
    name: 'symbols',
    description: 'Token symbols to check balances for (comma-separated)',
    example: 'USDC,USDT',
    required: true,
  })
  @ApiQuery({
    name: 'chainType',
    description: 'Blockchain type',
    enum: ['ethereum', 'solana'],
    example: 'ethereum',
    required: true,
  })
  @ApiQuery({
    name: 'blockchainNetwork',
    description: 'Specific blockchain network (optional)',
    example: 'Base',
    required: false,
  })
  @ApiStandardResponse(TokenBalanceResponseDto, 'Token balances retrieved successfully')
  @ApiResponse(GetBalanceErrorResponses.responses[0])
  @ApiResponse(GetBalanceErrorResponses.responses[1])
  @ApiResponse(GetBalanceErrorResponses.responses[2])
  async getBalance(
    @PrivyUser() userData: PrivyUserData,
    @Query('symbols') symbols: string,
    @Query('chainType') chainType: 'ethereum' | 'solana',
    @Query('blockchainNetwork') blockchainNetwork?: string,
  ): Promise<TokenBalanceResponseDto> {
    this.logger.log(`Fetching token balances for user ${userData.userId}`);
    const balances = await this.balanceService.getTokenBalance(userData.userId, symbols, chainType, blockchainNetwork);
    return { balances };
  }

  /**
   * Process a fiat withdrawal for the authenticated user.
   * @param dto The validated fiat withdrawal request body.
   * @param userData The authenticated user's data.
   * @returns Object containing the transaction details of the fiat withdrawal.
   */
  @Post('fiat/withdraw')
  @ApiOperation({
    summary: 'Process fiat withdrawal for authenticated user',
    description: 'Initiate a fiat withdrawal for the authenticated user.',
  })
  @ApiStandardResponse(FiatWithdrawalResponseDto, 'Fiat withdrawal processed successfully')
  @ApiResponse(FiatWithdrawalErrorResponses.R400_BAD_REQUEST)
  @ApiResponse(FiatWithdrawalErrorResponses.R401_UNAUTHORIZED)
  @ApiResponse(FiatWithdrawalErrorResponses.R500_INTERNAL_SERVER_ERROR)
  async processFiatWithdrawal(
    @PrivyUser() userData: PrivyUserData,
    @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) dto: FiatWithdrawalDto,
  ): Promise<FiatWithdrawalResponseDto> {
    this.logger.log(`Processing fiat withdrawal for user ${userData.userId} with params: ${JSON.stringify(dto)}`);
    return this.fiatWithdrawalService.processFiatWithdrawal(userData.userId, dto);
  }

  /**
   * Fetch the list of supported banks for a given fiat currency for fiat withdrawal.
   * @param fiatCode The fiat currency code (e.g., NGN, USD).
   * @returns List of supported banks.
   */
  @Get('banks/:fiatCode')
  @ApiOperation({
    summary: 'Get list of supported banks by fiat code',
    description: 'Fetch the list of supported banks for a given fiat currency code for fiat withdrawal.',
  })
  @ApiParam({ name: 'fiatCode', type: String, required: true, example: 'NGN', description: 'The fiat currency code (e.g., NGN, USD)' })
  @ApiStandardResponse(BankListResponseDto, 'List of supported banks retrieved successfully')
  @ApiResponse(GetBankListErrorResponses.R400_BAD_REQUEST)
  @ApiResponse(GetBankListErrorResponses.R500_INTERNAL_SERVER_ERROR)
  async getBankList(
    @Param('fiatCode') fiatCode: string,
  ): Promise<BankListResponseDto> {
    this.logger.log(`Fetching list of supported banks for fiat withdrawal for currency: ${fiatCode}`);
    const banks = await this.fiatWithdrawalService.getBanksByFiatCode(fiatCode);
    return { banks };
  }

  /**
   * Verify bank account details.
   * This is a public endpoint and does not require authentication.
   * @param verifyAccountDto The DTO containing institution code and account number.
   * @returns The verified account name.
   */
  @Post('fiat/verify-account')
  @ApiOperation({
    summary: 'Verify bank account details',
    description: 'Verifies bank account details with an external provider. This is a public endpoint.',
  })
  @ApiStandardResponse(VerifyAccountResponseDataDto, 'Account verified successfully')
  @ApiResponse(VerifyAccountErrorResponses.R400_BAD_REQUEST)
  @ApiResponse(VerifyAccountErrorResponses.R500_INTERNAL_SERVER_ERROR)
  @ApiResponse(VerifyAccountErrorResponses.R502_BAD_GATEWAY)
  @ApiResponse(VerifyAccountErrorResponses.R503_SERVICE_UNAVAILABLE)
  async verifyBankAccount(
    @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) verifyAccountDto: VerifyAccountDto,
  ): Promise<VerifyAccountResponseDataDto> {
    this.logger.log(`Request to verify bank account: ${JSON.stringify(verifyAccountDto)}`);
    const accountName = await this.fiatWithdrawalService.verifyAccountNumber(
      verifyAccountDto.institutionCode,
      verifyAccountDto.accountNumber,
    );
    return {
      accountName,
      message: 'Account verified successfully'
    };
  }

  /**
   * Fetch the current rate for a specific token to fiat currency conversion.
   * @param symbol - Cryptocurrency token symbol (e.g., USDT)
   * @param amount - Amount of the token
   * @param fiat - Fiat currency code (e.g., NGN)
   * @returns Object containing the rate and the original amount
   */
  @Get('rate')
  @ApiOperation({
    summary: 'Get token to fiat conversion rate',
    description: 'Fetch the current conversion rate for a specific token amount to fiat currency.',
  })
  @ApiQuery({ name: 'symbol', type: String, required: true, example: 'USDT', description: 'Cryptocurrency token symbol' })
  @ApiQuery({ name: 'amount', type: String, required: true, example: '1', description: 'Amount of the token' })
  @ApiQuery({ name: 'fiat', type: String, required: true, example: 'NGN', description: 'Fiat currency code' })
  @ApiStandardResponse(TokenRateResponseDto, 'Token rate fetched successfully')
  @ApiResponse(TokenRateErrorResponses.R400_BAD_REQUEST)
  @ApiResponse(TokenRateErrorResponses.R500_INTERNAL_SERVER_ERROR)
  async getTokenRate(
    @Query('symbol') symbol: string,
    @Query('amount') amount: string,
    @Query('fiat') fiat: string,
  ): Promise<TokenRateResponseDto> {
    this.logger.log(`Fetching token rate for ${symbol} amount ${amount} to ${fiat}`);
    const rateData = await this.fiatWithdrawalService.fetchTokenRate(symbol, amount, fiat);
    return rateData;
  }
}
