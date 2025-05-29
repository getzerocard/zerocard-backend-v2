import { Logger } from '@nestjs/common';
import { fetchTokenRate } from '../../../common/util/fetchTokenRate';

const logger = new Logger('FetchTokenRateHandler');

/**
 * Fetches the token rate for a given token amount and fiat currency.
 * @param aggregatorUrl - Base URL of the aggregator API (includes /v1)
 * @param symbol - Cryptocurrency token (e.g., 'USDT')
 * @param amount - Amount of the token
 * @param fiat - Fiat currency code (e.g., 'NGN')
 * @returns Promise<{ rate: string; amount: string }> - Object containing the rate and the original amount
 * @throws Error if the rate fetching fails
 */
export async function fetchTokenRateHandler(
    aggregatorUrl: string,
    symbol: string,
    amount: string,
    fiat: string,
): Promise<{ rate: string; amount: string }> {
    try {
        logger.log(`Fetching token rate for ${symbol} amount ${amount} to ${fiat}`);
        const rateData = await fetchTokenRate(aggregatorUrl, symbol, amount, fiat);
        logger.log(`Successfully fetched rate: ${rateData.rate} for ${symbol} to ${fiat}`);
        return rateData;
    } catch (error) {
        logger.error(`Error fetching token rate for ${symbol} to ${fiat}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}
