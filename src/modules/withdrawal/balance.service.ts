import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getTokenBalance } from '../../common/util/getTokenBalance';
import { PrivyService } from '../auth/privy.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { FundsLock } from '../Card/entity/fundsLock.entity';

/**
 * Service to handle token balance queries for users.
 */
@Injectable()
export class BalanceService {
    private readonly logger = new Logger(BalanceService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly privyService: PrivyService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(FundsLock)
        private readonly fundsLockRepository: Repository<FundsLock>,
    ) { }

    /**
     * Fetch token balances for a user across specified blockchain networks.
     * @param userId - The ID of the user to fetch balances for.
     * @param symbols - The token symbol(s) to check balances for.
     * @param chainType - The blockchain type ('ethereum' or 'solana').
     * @param blockchainNetwork - Optional specific blockchain network name.
     * @returns Promise<Record<string, Record<string, string>>> - A nested object with token symbols mapping to network-specific balance results.
     */
    async getTokenBalance(
        userId: string,
        symbols: string,
        chainType: 'ethereum' | 'solana',
        blockchainNetwork?: string,
    ): Promise<Record<string, Record<string, string>>> {
        this.logger.log(`Fetching token balances for user ${userId}`);

        // Get network type from configuration
        const networkType = this.configService.get<'MAINET' | 'TESTNET'>('offramp.network');
        if (!networkType || !['MAINET', 'TESTNET'].includes(networkType)) {
            throw new BadRequestException('Network type is not properly configured');
        }

        // Fetch user's wallet address
        const wallets = await this.privyService.getWalletId(userId, chainType);
        if (!wallets || wallets.length === 0) {
            throw new BadRequestException(`Wallet address not found for user ${userId}`);
        }
        // Select the first wallet address for the given chainType
        const userAddress = wallets[0].address;

        // Fetch balances using the utility function
        return await getTokenBalance(
            symbols,
            userAddress,
            chainType,
            blockchainNetwork,
            networkType,
            userId,
            this.userRepository,
            this.fundsLockRepository,
        );
    }
}

