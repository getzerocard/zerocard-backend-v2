import { Logger } from '@nestjs/common';
import { Transaction } from '../../Transaction/entity/transaction.entity';
import { User } from '../../user/entity/user.entity';

export async function saveFiatWithdrawal(
    transactionalEntityManager: any,  // Replace with the correct type, e.g., EntityManager
    user: User,
    offrampResponse: any,  // Replace with the actual type if defined
    fiat: string,
    chainType: string,
    blockchainNetwork: string | undefined,
    network: string,
    tokenSymbol: string,
    recipientDetails: any,  // Replace with the actual type
    status: 'completed' | 'refund'
): Promise<void> {
    const logger = new Logger('SaveFiatWithdrawalHandler');
    const tokenAmountUSD = parseFloat(offrampResponse.statusData.Amount) || 0;
    const fxRateRaw = offrampResponse.statusData.Rate ? parseFloat(offrampResponse.statusData.Rate) : 0;
    let calculatedDestinationfiatAmount: number | null = null;
    if (fxRateRaw > 0) {
        calculatedDestinationfiatAmount = parseFloat((tokenAmountUSD * fxRateRaw).toFixed(2));
    }
    const transaction = new Transaction();
    transaction.user = user;
    transaction.usdAmount = tokenAmountUSD;
    transaction.fiatAmount = calculatedDestinationfiatAmount;
    transaction.fiatCode = fiat;
    transaction.effectiveFxRate = fxRateRaw > 0 ? fxRateRaw : null;
    transaction.type = 'withdrawal';
    transaction.status = status;
    transaction.cardId = null;
    transaction.transactionReference = offrampResponse.statusData.TxHash || offrampResponse.orderId;
    transaction.merchantName = 'Zero Card';
    transaction.merchantId = 'zero_card';
    transaction.state = null;
    transaction.city = null;
    transaction.transactionHash = offrampResponse.statusData.TxHash;
    transaction.authorizationId = offrampResponse.orderId;
    transaction.category = 'fiat_withdrawal';
    transaction.channel = `bank_transfer_${fiat.toLowerCase()}`;
    transaction.transactionModeType = 'fiat_withdrawal';
    transaction.tokenInfo = [{ chain: chainType, blockchain: blockchainNetwork || network, token: tokenSymbol }];
    transaction.recipientAddress = recipientDetails.accountIdentifier;
    transaction.toAddress = recipientDetails.accountName + ' ' + recipientDetails.institution;
    await transactionalEntityManager.save(Transaction, transaction);
    logger.log(`Fiat withdrawal transaction saved for order ${offrampResponse.orderId} for user ${user.userId} with status ${status}`);
}
