import { Logger } from '@nestjs/common';
import type { SpendingLimit } from '../../spendingLimit/spendingLimit.entity';
import { TransactionChunk } from '../entity/transaction-chunk.entity';
import { calculateRate } from '../../../common/util/rateConversion.util';
import {
  addMoney,
  divideMoney,
  formatMoney,
  minMoney,
  subtractMoney,
  toMoney,
} from '../../../common/util/money';

/**
 * Allocates the fiat amount across spending limits and creates TransactionChunks.
 * @param fiatAmountToAllocate - The total fiat amount to allocate.
 * @param limits - An array of SpendingLimit entities to allocate the amount across.
 * @returns An object containing allocated chunks, updated limits, total USD equivalent, effective fxRate, and remaining unallocated amount.
 */
export function allocatefiatToLimits(
  fiatAmountToAllocate: number | string,
  limits: SpendingLimit[],
): {
  allocatedChunks: TransactionChunk[];
  updatedLimits: SpendingLimit[];
  usdTotal: number;
  effectiveFxRate: number;
  remainingAmount: number; // Amount that couldn't be allocated
  tokenInfo: { chain: string; blockchain: string; token: string }[];
} {
  const logger = new Logger('AllocatefiatToLimits');
  const fiatAmountDecimal = toMoney(fiatAmountToAllocate);
  logger.debug(
    `Allocating ${fiatAmountDecimal.toString()} fiat across ${limits.length} spending limits.`,
  );
  const allocatedChunks: TransactionChunk[] = [];
  const updatedLimits: SpendingLimit[] = [];
  let remainingAmountDecimal = fiatAmountDecimal;
  let usdTotalDecimal = toMoney(0);

  for (const limit of limits) {
    if (remainingAmountDecimal.lte(0)) {
      break; // Fully allocated
    }
    const limitfiatRemainingDecimal = toMoney(limit.fiatRemaining);
    if (limitfiatRemainingDecimal.lte(0)) {
      continue; // Skip limits with no balance
    }

    const fiatToUseFromLimitDecimal = minMoney(
      remainingAmountDecimal,
      limitfiatRemainingDecimal,
    );
    const fiatToUseFromLimit = parseFloat(
      formatMoney(fiatToUseFromLimitDecimal),
    );

    // Handle potential division by zero if fxRate is 0 or null
    const fxRateDecimal = limit.fxRate ? toMoney(limit.fxRate) : toMoney(0);
    const usdEquivalentDecimal = fxRateDecimal.gt(0)
      ? divideMoney(fiatToUseFromLimitDecimal, fxRateDecimal)
      : toMoney(0);
    const usdEquivalent = parseFloat(formatMoney(usdEquivalentDecimal));

    // Create a new chunk
    const chunk = new TransactionChunk(); // Use 'new' as we create instances
    chunk.spendingLimit = limit; // Link to the specific limit
    chunk.fiatUsed = fiatToUseFromLimit;
    chunk.usdEquivalent = usdEquivalent;
    // createdAt will be set automatically by TypeORM @CreateDateColumn

    allocatedChunks.push(chunk);

    // Update totals and remaining amounts
    usdTotalDecimal = addMoney(usdTotalDecimal, usdEquivalentDecimal);
    remainingAmountDecimal = subtractMoney(
      remainingAmountDecimal,
      fiatToUseFromLimitDecimal,
    );

    // Prepare the limit for update
    // Ensure fiatRemaining doesn't go below zero due to potential floating point inaccuracies
    const newfiatRemainingDecimal = subtractMoney(
      limitfiatRemainingDecimal,
      fiatToUseFromLimitDecimal,
    );
    limit.fiatRemaining = newfiatRemainingDecimal.gt(0)
      ? parseFloat(formatMoney(newfiatRemainingDecimal))
      : 0;
    updatedLimits.push(limit); // Add the modified limit to be saved later

    logger.debug(
      `Allocated ${fiatToUseFromLimit} from limit ${limit.id}. Remaining on limit: ${limit.fiatRemaining}. Total remaining to allocate: ${remainingAmountDecimal.toString()}`,
    );
  }
  const usdTotal = parseFloat(formatMoney(usdTotalDecimal));
  const remainingAmount = parseFloat(formatMoney(remainingAmountDecimal));
  logger.debug(
    `Finished allocation. Total USD: ${usdTotal}. Chunks created: ${allocatedChunks.length}. Unallocated fiat: ${remainingAmount}`,
  );

  // Calculate the effective fxRate for the transaction
  const allocatedfiatDecimal = subtractMoney(
    fiatAmountDecimal,
    remainingAmountDecimal,
  );
  const effectiveFxRate =
    allocatedfiatDecimal.gt(0) && usdTotalDecimal.gt(0)
      ? calculateRate(usdTotalDecimal.toNumber(), allocatedfiatDecimal.toNumber())
      : 0;

  return {
    allocatedChunks,
    updatedLimits,
    usdTotal,
    effectiveFxRate,
    remainingAmount,
    tokenInfo: allocatedChunks.map((chunk) => ({
      chain: chunk.spendingLimit.chainType,
      blockchain: chunk.spendingLimit.blockchainNetwork || '',
      token: chunk.spendingLimit.tokenSymbol,
    })),
  };
}
