import { ApiProperty } from '@nestjs/swagger';

export class GetCardDetailsResponseDto {
    @ApiProperty({
        description: 'Card ID',
        example: 'card_123456789',
    })
    _id: string;

    @ApiProperty({
        description: 'Business ID',
        example: 'business_987654321',
    })
    business: string;

    @ApiProperty({
        description: 'Card type',
        example: 'physical',
    })
    type: string;

    @ApiProperty({
        description: 'Card brand',
        example: 'Verve',
    })
    brand: string;

    @ApiProperty({
        description: 'Currency of the card',
        example: 'NGN',
    })
    currency: string;

    @ApiProperty({
        description: 'Masked PAN (card number)',
        example: '1234-XXXX-XXXX-5678',
    })
    maskedPan: string;

    @ApiProperty({
        description: 'Expiry month',
        example: '12',
    })
    expiryMonth: string;

    @ApiProperty({
        description: 'Expiry year',
        example: '2025',
    })
    expiryYear: string;

    @ApiProperty({
        description: 'Card status',
        example: 'active',
    })
    status: string;

    @ApiProperty({
        description: 'Whether 2FA is enrolled',
        example: true,
    })
    is2FAEnrolled: boolean;

    @ApiProperty({
        description: 'Whether the card is digitalized',
        example: false,
    })
    isDigitalized: boolean;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-10-01T12:00:00Z',
    })
    createdAt: string;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-10-02T12:00:00Z',
    })
    updatedAt: string;
}

export class GetCardDetailsErrorResponses {
    static responses = [
        {
            status: 400,
            description: 'Bad Request',
            examples: {
                badRequest: {
                    summary: 'Bad Request',
                    value: { statusCode: 400, success: false, message: 'Invalid request parameters' },
                },
            },
        },
        {
            status: 401,
            description: 'Unauthorized',
            examples: {
                unauthorized: {
                    summary: 'Unauthorized',
                    value: { statusCode: 401, success: false, message: 'Unauthorized access' },
                },
            },
        },
        {
            status: 403,
            description: 'Forbidden',
            examples: {
                forbidden: {
                    summary: 'Forbidden',
                    value: { statusCode: 403, success: false, message: 'Cannot fetch card details for another user' },
                },
            },
        },
        {
            status: 404,
            description: 'Not Found',
            examples: {
                notFound: {
                    summary: 'User or Card Not Found',
                    value: { statusCode: 404, success: false, message: 'User or card not found' },
                },
            },
        },
        {
            status: 500,
            description: 'Internal Server Error',
            examples: {
                internalError: {
                    summary: 'Internal Server Error',
                    value: { statusCode: 500, success: false, message: 'Failed to fetch card due to internal error' },
                },
            },
        },
    ];
}
