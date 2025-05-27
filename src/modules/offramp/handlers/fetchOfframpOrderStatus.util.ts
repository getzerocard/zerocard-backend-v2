import { Logger } from '@nestjs/common';
import { calculateWeightedRate } from './calculateWeightedRate.util';
// Assuming ConfigService might be needed if AGGREGATOR_URL comes from config

const logger = new Logger('FetchOfframpOrderStatus');

// Define a basic structure for the expected response
// Adjust this based on the actual API response structure
interface OrderStatusData {
  orderId: string;
  chainId: string;
  status: string;
  // Add other relevant fields from the API response
  amount: string;
  token: string;
  settlePercent: string;
  txHash: string;
  settlements?: {
    splitOrderId: string;
    amount: string;
    rate: string;
    orderPercent: string;
  }[];
  txReceipts?: { status: string; txHash: string; timestamp: string }[];
  updatedAt: string;
  [key: string]: any;
}

interface OrderStatusResponse {
  data?: OrderStatusData;
  error?: {
    status: number;
    message: string;
  };
}

/**
 * Fetches the status of an offramp order from the aggregator.
 *
 * @param aggregatorUrl - The base URL of the aggregator API.
 * @param chainId - The blockchain chain ID.
 * @param orderId - The order ID to check.
 * @returns Promise<{ OrderID: string; Amount: string; Token: string; Status: string; TxHash: string; Rate?: string; }> - The order status data with an optional weighted average rate.
 *
 * @example
 * const status = await fetchOfframpOrderStatus('https://api.aggregator.com/v1', '137', 'order123');
 * // Returns: { OrderID: 'order123', Amount: '100.00', Token: 'ETH', Status: 'settled', TxHash: '0xabcdef123456...', Rate: '1.05' }
 */
export async function fetchOfframpOrderStatus(
  aggregatorUrl: string,
  chainId: string,
  orderId: string,
): Promise<{
  OrderID: string;
  Amount: string;
  Token: string;
  Status: string;
  TxHash: string;
  Rate?: string;
  error?: string;
}> {
  const defaultResponse = {
    OrderID: orderId,
    Amount: '0',
    Token: '',
    Status: 'pending',
    TxHash: '',
    Rate: '0',
  };

  try {
    if (!aggregatorUrl) {
      // This check is fine here, it's a precondition.
      throw new Error('Aggregator URL is required');
    }

    const maxRetries = 23; // Set to 23 attempts for approximately 45 seconds of polling
    const retryIntervalMs = 6500; // Retry every 2 seconds

    const finalStates = ['settled', 'refunded', 'validated'];
    const retryStates = ['pending', 'fulfilled', 'processing']; // States that allow retries

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Set a timeout of 3 seconds for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const requestUrl = `${aggregatorUrl}/orders/${chainId}/${orderId}`;
        logger.debug(
          `[FetchOfframpOrderStatus] Attempt ${attempt + 1}/${maxRetries} - Fetching order status from URL: ${requestUrl}`,
        );

        const response = await fetch(requestUrl, { signal: controller.signal });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          logger.error(
            `[FetchOfframpOrderStatus] HTTP error for order ${orderId} (attempt ${attempt + 1}/${maxRetries}) - Status: ${response.status}, Body: ${errorBody}`,
          );
          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        const data: OrderStatusResponse = await response.json();
        logger.debug(`[FetchOfframpOrderStatus] Attempt ${attempt + 1}/${maxRetries} - Full response data for order ${orderId}: ${JSON.stringify(data, null, 2)}`);

        if (!data?.data) {
          logger.warn(`Invalid response structure for order ${orderId}`);
          return {
            ...defaultResponse,
            Status: 'invalid_response',
            error: 'Invalid API response structure',
          };
        }

        // Extract specific fields as requested
        const extractedData = {
          OrderID: data.data.orderId,
          Amount: data.data.amount,
          Token: data.data.token,
          Status: data.data.status,
          TxHash: data.data.txHash,
          Rate: '', // Initialize Rate as empty string, will be updated if calculated
          // Include any other fields if necessary
        };

        // Calculate rate if settlements exist, regardless of status
        if (data.data.settlements && Array.isArray(data.data.settlements)) {
          logger.debug(`[FetchOfframpOrderStatus] Settlements array for order ${orderId}: ${JSON.stringify(data.data.settlements, null, 2)}`);
          const calculatedRate = calculateWeightedRate(data.data.settlements);
          logger.debug(`[FetchOfframpOrderStatus] Calculated rate for order ${orderId}: ${JSON.stringify(calculatedRate)}`);
          extractedData.Rate = calculatedRate;
        }

        const statusLower = data.data.status.toLowerCase();

        // Check if we've reached a terminal state
        if (finalStates.includes(statusLower)) {
          logger.log(`Order ${orderId} reached final state: ${statusLower}`);
          return {
            OrderID: extractedData.OrderID,
            Amount: extractedData.Amount,
            Token: extractedData.Token,
            Status: extractedData.Status,
            TxHash: extractedData.TxHash,
            Rate: extractedData.Rate,
          };
        }

        // Only retry if in retryable state and attempts remain
        if (retryStates.includes(statusLower)) {
          logger.log(`Retrying (${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
          continue;
        }

        // If not final state and no retries left, return current status
        logger.log(`Max retries reached for order ${orderId} with non-final status: ${statusLower}`);
        return {
          OrderID: extractedData.OrderID,
          Amount: extractedData.Amount,
          Token: extractedData.Token,
          Status: extractedData.Status,
          TxHash: extractedData.TxHash,
          Rate: extractedData.Rate,
        };

      } catch (error) {
        if (attempt === maxRetries - 1) {
          return {
            ...defaultResponse,
            Status: 'retry_failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
        await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
      }
    }

    return {
      ...defaultResponse,
      Status: 'max_retries',
      error: 'Max polling attempts reached',
    };
  } catch (finalError) {
    logger.error(`Final error for order ${orderId}`);
    return {
      ...defaultResponse,
      Status: 'critical_error',
      error: finalError instanceof Error ? finalError.message : 'Unknown critical error',
    };
  }
}
