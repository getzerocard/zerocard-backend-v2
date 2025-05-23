import { Logger } from '@nestjs/common';
import { divideMoney, multiplyMoney, toMoney } from './money';

const logger = new Logger('RateConversionUtil');

/**
 * Converts a fiat amount to its equivalent Dollar amount based on an exchange rate.
 *
 * @param fiatAmount - The amount in fiat.
 * @param exchangeRate - The exchange rate (fiat per 1 Dollar).
 * @returns The equivalent amount in Dollars.
 * @throws {Error} If the exchange rate is zero or negative.
 */
export function convertfiatToDollars(
  fiatAmount: number | string,
  exchangeRate: number | string,
): number {
  const exchangeRateDecimal = toMoney(exchangeRate);
  if (exchangeRateDecimal.lte(0)) {
    logger.error(
      `Invalid exchange rate for NGN to USD conversion: ${exchangeRateDecimal.toString()}`,
    );
    throw new Error('Exchange rate must be positive.');
  }
  const fiatDecimal = toMoney(fiatAmount);
  const dollarDecimal = divideMoney(fiatDecimal, exchangeRateDecimal);
  return parseFloat(dollarDecimal.toFixed(2));
}

/**
 * Converts a Dollar amount to its equivalent fiat amount based on an exchange rate.
 *
 * @param dollarAmount - The amount in Dollars.
 * @param exchangeRate - The exchange rate (fiat per 1 Dollar).
 * @returns The equivalent amount in fiat.
 * @throws {Error} If the exchange rate is zero or negative.
 */
export function convertDollarsTofiat(
  dollarAmount: number | string,
  exchangeRate: number | string,
): number {
  const exchangeRateDecimal = toMoney(exchangeRate);
  if (exchangeRateDecimal.lte(0)) {
    logger.error(
      `Invalid exchange rate for USD to NGN conversion: ${exchangeRateDecimal.toString()}`,
    );
    throw new Error('Exchange rate must be positive.');
  }
  const dollarDecimal = toMoney(dollarAmount);
  const fiatDecimal = multiplyMoney(dollarDecimal, exchangeRateDecimal);
  return parseFloat(fiatDecimal.toFixed(2));
}

/**
 * Calculates the exchange rate between Dollar and fiat amounts.
 *
 * @param dollarAmount - The amount in Dollars.
 * @param fiatAmount - The amount in fiat.
 * @returns The exchange rate.
 */
export function calculateRate(
  dollarAmount: number | string,
  fiatAmount: number | string,
): number {
  const fiatDecimal = toMoney(fiatAmount);
  const dollarDecimal = toMoney(dollarAmount);
  if (fiatDecimal.isZero() || dollarDecimal.isZero()) {
    logger.error('No fiat or Dollar amount provided for rate calculation');
    throw new Error('No fiat or Dollar amount provided for rate calculation');
  }
  const rateDecimal = divideMoney(fiatDecimal, dollarDecimal);
  return parseFloat(rateDecimal.toFixed(4));
}
