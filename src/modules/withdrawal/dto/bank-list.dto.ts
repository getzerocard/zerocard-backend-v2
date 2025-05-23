import { ApiProperty } from '@nestjs/swagger';

export class BankDto {
    @ApiProperty({
        description: 'Bank code or identifier',
        example: '058',
    })
    code: string;

    @ApiProperty({
        description: 'Bank name',
        example: 'Guaranty Trust Bank',
    })
    name: string;

    @ApiProperty({
        description: 'Institution type (e.g., bank)',
        example: 'bank',
        required: false,
    })
    type?: string;
}

export class BankListResponseDto {
    @ApiProperty({
        description: 'List of supported banks',
        type: [BankDto],
    })
    banks: BankDto[];
}

export class GetBankListErrorResponses {
    static readonly R400_BAD_REQUEST = {
        status: 400,
        description: 'Bad Request - Invalid fiat code or other parameters.',
        examples: {
            invalidFiatCode: {
                summary: 'Invalid Fiat Code',
                value: { statusCode: 400, success: false, message: 'Invalid fiat code provided.' },
            },
        },
    };

    static readonly R500_INTERNAL_SERVER_ERROR = {
        status: 500,
        description: 'Internal Server Error - Failed to fetch bank list or aggregator URL not configured.',
        examples: {
            fetchFailed: {
                summary: 'Fetch Failed',
                value: { statusCode: 500, success: false, message: 'Failed to fetch banks for fiat code XXX' },
            },
            configError: {
                summary: 'Configuration Error',
                value: { statusCode: 500, success: false, message: 'Aggregator URL is not configured' },
            }
        },
    };
}
