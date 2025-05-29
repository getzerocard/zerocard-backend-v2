import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for token rate response data
 */
export class TokenRateResponseDto {
    @ApiProperty({
        description: 'The10: The conversion rate from token to fiat currency',
        example: '1585.43',
    })
    rate: string;

    @ApiProperty({
        description: 'The amount of token for which the rate is fetched',
        example: '1',
    })
    amount: string;
}

/**
 * Error responses for token rate endpoint
 */
export class TokenRateErrorResponses {
    static R400_BAD_REQUEST = {
        status: 400,
        description: 'Bad Request - Missing or invalid parameters',
        examples: {
            missingParams: {
                summary: 'Missing required parameters',
                value: { statusCode: 400, success: false, message: 'Symbol, amount, and fiat currency are required.' },
            },
        },
    };

    static R500_INTERNAL_SERVER_ERROR = {
        status: 500,
        description: 'Internal Server Error - Unexpected server error',
        examples: {
            serverError: {
                summary: 'Server error',
                value: { statusCode: 500, success: false, message: 'Service failed to fetch token rate: Unknown internal error' },
            },
        },
    };
}
