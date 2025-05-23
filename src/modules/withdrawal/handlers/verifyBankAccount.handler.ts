import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import fetch from 'node-fetch'; // Ensure node-fetch is installed or use a built-in alternative if available

const logger = new Logger('VerifyBankAccountHandler');

interface PaycrestVerifyResponse {
    status: string;
    message: string;
    data?: string; // Account name is in data field
}

/**
 * Verifies bank account details with an external provider.
 * @param institutionCode The code for the financial institution.
 * @param accountNumber The bank account number to verify.
 * @param aggregatorUrl The base URL for the verification API (e.g., "https://api.paycrest.io/v1").
 * @returns The account holder's name if verification is successful.
 * @throws HttpException if the API call fails or returns an error.
 */
export const verifyBankAccount = async (
    institutionCode: string,
    accountNumber: string,
    aggregatorUrl: string, // Make aggregator URL configurable
): Promise<string> => {
    const bankData = {
        institution: institutionCode,
        accountIdentifier: accountNumber,
    };

    const verificationUrl = `${aggregatorUrl}/verify-account`;
    logger.log(`Verifying account: ${accountNumber} with institution: ${institutionCode} via ${verificationUrl}`);

    try {
        const response = await fetch(verificationUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bankData),
        });

        const responseBody = await response.json() as PaycrestVerifyResponse;

        if (!response.ok) {
            logger.error(`Paycrest API error: ${response.status} - ${responseBody.message || 'Unknown error'}`);
            throw new HttpException(
                responseBody.message || `Failed to verify account: ${response.status}`,
                response.status || HttpStatus.BAD_GATEWAY,
            );
        }

        if (responseBody.status === 'success' && responseBody.data) {
            logger.log(`Account verification successful for ${accountNumber}: ${responseBody.data}`);
            return responseBody.data; // This is the account name "IDOWU, MICHAEL SEYI"
        } else {
            logger.warn(`Account verification failed or data field missing for ${accountNumber}: ${responseBody.message}`);
            throw new HttpException(
                responseBody.message || 'Account verification failed or name not found in response.',
                HttpStatus.BAD_REQUEST, // Or another appropriate status
            );
        }
    } catch (error: any) {
        logger.error(`Error during bank account verification for ${accountNumber}: ${error.message}`, error.stack);
        if (error instanceof HttpException) {
            throw error;
        }
        throw new HttpException(
            `An external error occurred during account verification: ${error.message}`,
            HttpStatus.SERVICE_UNAVAILABLE, // Or BAD_GATEWAY
        );
    }
};
