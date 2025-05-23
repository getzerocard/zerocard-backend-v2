import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyAccountDto {
    @ApiProperty({
        description: 'The code for the financial institution (e.g., bank code).',
        example: 'KUDAHAMG',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    institutionCode: string;

    @ApiProperty({
        description: 'The bank account number to verify.',
        example: '0123456789',
        required: true,
        minLength: 10, // Example validation, adjust as needed
        maxLength: 15,
    })
    @IsString()
    @IsNotEmpty()
    @Length(10, 10) // Example: For NGN bank accounts, often 10 digits
    accountNumber: string;
}

export class VerifyAccountResponseDataDto {
    @ApiProperty({
        description: "The verified account holder's name.",
        example: "JOHN DOE",
    })
    accountName: string;

    @ApiProperty({
        description: "A message indicating the outcome of the verification.",
        example: "Account verified successfully",
    })
    message: string;
}

export class VerifyAccountErrorResponses {
    static readonly R400_BAD_REQUEST = {
        status: 400,
        description: 'Bad Request - Invalid input data (e.g., missing fields, invalid account number format).',
        examples: {
            invalidInput: {
                summary: 'Invalid Input',
                value: { statusCode: 400, success: false, message: 'Invalid input: [details of validation error]' },
            },
            verificationFailedProvider: { // From Paycrest, if it returns a 400 with a specific message
                summary: 'Verification Failed (Provider)',
                value: { statusCode: 400, success: false, message: 'Account verification failed or name not found in response.' },
            },
        },
    };

    static readonly R500_INTERNAL_SERVER_ERROR = {
        status: 500,
        description: 'Internal Server Error - An unexpected error occurred on the server or configuration issue.',
        examples: {
            configError: {
                summary: 'Configuration Error',
                value: { statusCode: 500, success: false, message: 'Configuration error: Aggregator URL is not set.' },
            },
            serviceError: {
                summary: 'Service Error',
                value: { statusCode: 500, success: false, message: 'Service failed to verify account details: Unknown internal error' },
            },
        },
    };

    static readonly R502_BAD_GATEWAY = { // Or 503 Service Unavailable, if the external service is down
        status: 502,
        description: 'Bad Gateway - Error communicating with the external verification service.',
        examples: {
            externalApiError: {
                summary: 'External API Error',
                value: { statusCode: 502, success: false, message: 'Failed to verify account: [status from provider]' },
            },
        },
    };

    static readonly R503_SERVICE_UNAVAILABLE = {
        status: 503,
        description: 'Service Unavailable - External verification service is temporarily unavailable.',
        examples: {
            externalApiDown: {
                summary: 'External API Down',
                value: { statusCode: 503, success: false, message: 'An external error occurred during account verification: [details]' },
            },
        },
    };
}
