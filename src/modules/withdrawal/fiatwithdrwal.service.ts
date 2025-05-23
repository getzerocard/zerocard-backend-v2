import { Injectable, BadRequestException, UnauthorizedException, Logger, InternalServerErrorException, NotFoundException, HttpException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { OfframpService } from '../offramp/offramp.service';
import { ConfigService } from '@nestjs/config';
import { PrivyService } from '../auth/privy.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { FundsLock } from '../Card/entity/fundsLock.entity';
import { Transaction } from '../Transaction/entity/transaction.entity';
import { getTokenBalance } from '../../common/util/getTokenBalance';
import { fetchInstitutionsByFiatCode } from './handlers/getInstitutions.handler';
import { FiatWithdrawalDto } from './dto/fiat-withdrawal.dto';
import { verifyBankAccount } from './handlers/verifyBankAccount.handler';

@Injectable()
export class FiatWithdrawalService {
    private readonly logger = new Logger(FiatWithdrawalService.name);
    constructor(
        @Inject(OfframpService)
        private readonly offrampService: OfframpService,
        private readonly configService: ConfigService,
        private readonly privyService: PrivyService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(FundsLock)
        private readonly fundsLockRepository: Repository<FundsLock>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) { }

    /**
     * Delegates fiat withdrawal to the OfframpService's createOrder method after eligibility and balance checks.
     * @param userId - User's ID for Privy wallet
     * @param dto - FiatWithdrawalDto containing all necessary parameters for the withdrawal
     * @returns Promise<{ orderId: string; statusData: { OrderID: string; Amount: string; Token: string; Status: string; TxHash: string; Rate?: string } }>
     */
    async processFiatWithdrawal(
        userId: string,
        dto: FiatWithdrawalDto,
    ): Promise<{
        orderId: string;
        statusData: {
            OrderID: string;
            Amount: string;
            Token: string;
            Status: string;
            TxHash: string;
            Rate?: string;
        };
    }> {
        this.logger.log(`Processing fiat withdrawal for user ${userId} with data: ${JSON.stringify(dto)}`);

        const {
            chainType,
            tokenSymbol,
            // Consider if this should always come from configService instead of DTO
            amount,
            fiat,
            recipientDetails,
            blockchainNetwork,
        } = dto;
        const network = this.configService.get<'MAINET' | 'TESTNET'>('offramp.network')
        if (!network || !['MAINET', 'TESTNET'].includes(network)) {
            throw new BadRequestException('Network type is not properly configured')

        }
        // Check if the user exists and is a main user
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for fiat withdrawal.`);
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        if (user.subUsers && user.subUsers.length > 0) {
            this.logger.warn(`Attempted fiat withdrawal by sub-user ${userId}.`);
            throw new UnauthorizedException('Sub-users are not allowed to make withdrawals');
        }

        // Get network type from configuration (this should likely be the source of truth for 'network')
        const configuredNetworkType = this.configService.get<'MAINET' | 'TESTNET'>('offramp.network');
        if (!configuredNetworkType || !['MAINET', 'TESTNET'].includes(configuredNetworkType)) {
            this.logger.error('Offramp network type is not properly configured.');
            throw new InternalServerErrorException('Network type is not properly configured');
        }
        // Potentially validate dto.network against configuredNetworkType or just use configuredNetworkType

        // Fetch user's wallet address
        const wallets = await this.privyService.getWalletId(userId, chainType);
        if (!wallets || wallets.length === 0) {
            this.logger.warn(`Wallet address not found for user ${userId} and chainType ${chainType}.`);
            throw new BadRequestException(`Wallet address not found for user ${userId} on ${chainType}`);
        }
        const userAddress = wallets[0].address;

        // Check user's balance before withdrawal
        try {
            const balanceResult = await getTokenBalance(
                tokenSymbol,
                userAddress,
                chainType,
                blockchainNetwork,
                configuredNetworkType, // Use configured network type
                userId,
                this.userRepository,
                this.fundsLockRepository,
            );
            const balance =
                balanceResult[tokenSymbol] &&
                    balanceResult[tokenSymbol][blockchainNetwork || '']
                    ? parseFloat(balanceResult[tokenSymbol][blockchainNetwork || ''])
                    : 0;
            const withdrawalAmount = parseFloat(amount);
            if (isNaN(balance) || balance < withdrawalAmount) {
                this.logger.warn(`Insufficient balance for user ${userId}. Available: ${balance} ${tokenSymbol}, Requested: ${withdrawalAmount} ${tokenSymbol}`);
                throw new BadRequestException(
                    `Insufficient balance for withdrawal. Available: ${balance} ${tokenSymbol}, Requested: ${withdrawalAmount} ${tokenSymbol}`,
                );
            }
            this.logger.log(
                `Balance check passed for user ${userId}. Available: ${balance} ${tokenSymbol}`,
            );
        } catch (error: any) {
            this.logger.error(`Error during balance check for user ${userId}: ${error.message}`, error.stack);
            if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof InternalServerErrorException) throw error;
            throw new InternalServerErrorException(`Failed to verify balance: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Proceed with fiat withdrawal
        try {
            const offrampResponse = await this.offrampService.createOrder(
                userId,
                chainType,
                tokenSymbol,
                network,
                amount,
                fiat,
                {
                    accountIdentifier: recipientDetails.accountIdentifier,
                    accountName: recipientDetails.accountName,
                    institution: recipientDetails.institution,
                    memo: recipientDetails.memo || '',
                },
                blockchainNetwork,
            );

            // If the withdrawal is immediately settled, save the transaction record.
            // If it\'s pending, it might be handled by a webhook or subsequent status check.
            if (offrampResponse.statusData && offrampResponse.statusData.Status && offrampResponse.statusData.Status.toLowerCase() === 'settled') {
                this.logger.log(`Offramp order ${offrampResponse.orderId} settled for user ${userId}. Saving transaction.`);

                // Prepare transaction data from the direct response of createOrder
                const tokenAmountUSD = parseFloat(offrampResponse.statusData.Amount) || 0; // This is the amount in token (e.g., USDC)
                // Assuming Rate is already in the correct decimal format (e.g., 1500 means 1500)
                const fxRateRaw = offrampResponse.statusData.Rate ? parseFloat(offrampResponse.statusData.Rate) : 0;

                // Calculate the destination fiat amount based on the token amount and FX rate
                // This will be stored in the `fiatAmount` field of the Transaction entity for now.
                let calculatedDestinationfiatAmount: number | null = null;
                if (fxRateRaw > 0) {
                    calculatedDestinationfiatAmount = parseFloat((tokenAmountUSD * fxRateRaw).toFixed(2));
                }

                await this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
                    const transaction = new Transaction();
                    transaction.user = user;
                    transaction.usdAmount = tokenAmountUSD; // Amount in USD (or stablecoin equivalent)
                    transaction.fiatAmount = calculatedDestinationfiatAmount; // Calculated destination fiat amount (e.g., NGN, CFA)
                    transaction.fiatCode = fiat; // Set fiatCode from DTO input
                    transaction.effectiveFxRate = fxRateRaw > 0 ? fxRateRaw : null;
                    transaction.type = 'withdrawal';
                    transaction.status = 'completed'; // Since statusData.Status is 'settled'
                    transaction.cardId = null;
                    transaction.transactionReference = offrampResponse.statusData.TxHash || offrampResponse.orderId;
                    transaction.merchantName = 'Zero Card Fiat Withdrawal';
                    transaction.merchantId = 'zerocard_fiat_withdrawal';
                    transaction.state = null;
                    transaction.city = null;
                    transaction.transactionHash = offrampResponse.statusData.TxHash || null;
                    transaction.authorizationId = offrampResponse.orderId;
                    transaction.category = 'fiat_withdrawal';
                    transaction.channel = `bank_transfer_${fiat.toLowerCase()}`; // fiat is the target currency code from input DTO
                    transaction.transactionModeType = 'fiat_offramp';
                    transaction.tokenInfo = [{
                        chain: chainType, // from input DTO
                        blockchain: blockchainNetwork || network, // from input DTO or config
                        token: tokenSymbol, // from input DTO
                    }];
                    transaction.recipientAddress = recipientDetails.accountIdentifier;
                    transaction.toAddress = recipientDetails.accountIdentifier;

                    await transactionalEntityManager.save(Transaction, transaction);
                    this.logger.log(`Fiat withdrawal transaction saved for user ${userId}, order ${offrampResponse.orderId}`);
                });
            } else {
                this.logger.log(`Offramp order ${offrampResponse.orderId} for user ${userId} has status: ${offrampResponse.statusData?.Status}. Not saving transaction record yet.`);
            }

            return offrampResponse; // Return the original offramp response

        } catch (error: any) {
            this.logger.error(`Offramp service createOrder failed for user ${userId}: ${error.message}`, error.stack);
            if (error.status && typeof error.message === 'string') {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to process fiat withdrawal: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Verifies bank account number using an external service via verifyBankAccount handler.
     * @param institutionCode The code for the financial institution.
     * @param accountNumber The bank account number to verify.
     * @returns Promise<string> The account holder\'s name.
     * @throws InternalServerErrorException if the aggregator URL is not configured.
     * @throws HttpException (from handler) if verification fails or external service errors.
     */
    async verifyAccountNumber(institutionCode: string, accountNumber: string): Promise<string> {
        this.logger.log(`Service request to verify account: ${accountNumber} for institution: ${institutionCode}`);

        const aggregatorUrl = this.configService.get<string>('aggregator.url');
        if (!aggregatorUrl) {
            this.logger.error('Aggregator URL is not configured for account verification.');
            throw new InternalServerErrorException('Configuration error: Aggregator URL is not set.');
        }

        try {
            // Priority 1: Basic input validation (already handled by types, but could add more)
            if (!institutionCode || !accountNumber) {
                throw new BadRequestException('Institution code and account number are required.');
            }

            // Priority 2: Call the handler
            const accountName = await verifyBankAccount(institutionCode, accountNumber, aggregatorUrl);
            this.logger.log(`Account verified successfully by service: ${accountName}`);
            return accountName;
        } catch (error: any) {
            this.logger.error(
                `Service error during account verification for ${accountNumber} with institution ${institutionCode}: ${error.message}`,
                error.stack
            );
            // Re-throw HttpException from handler, or wrap other errors
            if (error instanceof HttpException) {
                throw error;
            }
            // Fallback for non-HttpExceptions from the handler or other unexpected issues
            throw new InternalServerErrorException(
                `Service failed to verify account details: ${error.message || 'Unknown internal error'}`
            );
        }
    }

    /**
     * Fetches all banks for a given fiat code using the aggregator URL from config.
     * @param fiatCode The fiat currency code (e.g., 'USD', 'NGN').
     * @returns Promise resolving to an array of banks.
     */
    async getBanksByFiatCode(fiatCode: string): Promise<any[]> {
        if (!fiatCode || typeof fiatCode !== 'string' || fiatCode.trim() === '') {
            this.logger.warn('Attempted to fetch banks with invalid fiat code.');
            throw new BadRequestException('Fiat code must be a non-empty string.');
        }
        try {
            const aggregatorUrl = this.configService.get<string>('aggregator.url');
            if (!aggregatorUrl) {
                this.logger.error('Aggregator URL is not configured for fetching banks.');
                throw new InternalServerErrorException('Aggregator URL is not configured');
            }
            this.logger.log(`Fetching banks for fiat code: ${fiatCode} using URL: ${aggregatorUrl}`);
            return await fetchInstitutionsByFiatCode(fiatCode, aggregatorUrl);
        } catch (error: any) {
            this.logger.error(`Failed to fetch banks for fiat code ${fiatCode}: ${error.message}`, error.stack);
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to fetch banks for fiat code ${fiatCode}: ${error.message}`);
        }
    }
}
