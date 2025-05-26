import { HttpException, HttpStatus } from '@nestjs/common';
import type { AxiosError } from 'axios';
import axios from 'axios';

interface ApiErrorResponse {
  statusCode?: number; // Added statusCode for more specific error handling
  message: string;
  responseCode?: string; // External API might also include this in errors
}

interface SendPinSuccessResponse {
  statusCode: number;
  message: string;
  responseCode: string;
}

/**
 * Sends default PIN for a specific card
 * @param zerocardBaseUrl The base URL for the ZeroCard API
 * @param zerocardAuthToken The authentication token for ZeroCard API
 * @param cardId The unique identifier of the card
 * @returns Response data from PIN sending operation
 */
export async function sendCardDefaultPin(
  zerocardBaseUrl: string,
  zerocardAuthToken: string,
  cardId: string,
): Promise<SendPinSuccessResponse> {
  try {
    const response = await axios.put<SendPinSuccessResponse>(
      `${zerocardBaseUrl}/cards/${cardId}/send-pin`,
      {},
      {
        headers: {
          Authorization: zerocardAuthToken,
        },
      },
    );
    // Assuming the external API returns 200 on success as per the example
    // and that response.data matches SendPinSuccessResponse
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    let errorMessage = 'Failed to send card PIN';
    let errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (axiosError.response && axiosError.response.data) {
      errorMessage = axiosError.response.data.message || errorMessage;
      errorStatus = axiosError.response.status || errorStatus;

      // Specifically handle "Card not found." from the external API
      if (axiosError.response.status === 400 && axiosError.response.data.message === 'Card not found.') {
        // We will throw an HttpException with 400, which the service will catch.
        // The service will then map this to our standard error DTO if needed,
        // but the status and message are preserved.
      }
    }
    // Always throw HttpException so the service layer can expect it
    throw new HttpException(errorMessage, errorStatus);
  }
}
