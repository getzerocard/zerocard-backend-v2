import { ApiProperty } from '@nestjs/swagger';

export class SendDefaultPinDataDto {
    @ApiProperty({
        description: 'Indicates whether the PIN was sent successfully',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'A message confirming the PIN sending status',
        example: 'Approved or completed successfully',
    })
    message: string;

    // Add any other relevant properties from the actual sendCardDefaultPin handler response
    // For example, if the API returns a reference ID or specific status codes:
    // @ApiProperty({ example: 'pin_send_ref_12345' , required: false})
    // referenceId?: string;
}

export class SendDefaultPinErrorResponses {
    static responses = [
        {
            status: 400,
            description: 'Bad Request - User ID is missing, user has no card associated, or card not found by provider.',
            examples: {
                noUserId: {
                    summary: 'User ID Missing',
                    value: {
                        statusCode: 400,
                        success: false,
                        message: 'User ID is required.',
                    },
                },
                noCardAssociated: {
                    summary: 'No Card Associated With User',
                    value: {
                        statusCode: 400,
                        success: false,
                        message: 'User does not have a card associated.',
                    },
                },
                providerCardNotFound: {
                    summary: 'Card Not Found By Provider',
                    value: {
                        statusCode: 400,
                        success: false,
                        message: 'Card not found.',
                    },
                },
            },
        },
        {
            status: 404,
            description: 'User not found (in our system).',
            examples: {
                userNotFound: {
                    summary: 'User Not Found',
                    value: { statusCode: 404, success: false, message: 'User not found' },
                },
            },
        },
        {
            status: 500,
            description: 'Internal server error or other error from the card provider.',
            examples: {
                providerError: {
                    summary: 'Card Provider Error (Other)',
                    value: {
                        statusCode: 500,
                        success: false,
                        message: 'Failed to send card PIN',
                    },
                },
                unexpectedError: {
                    summary: 'Unexpected Internal Error',
                    value: {
                        statusCode: 500,
                        success: false,
                        message: 'An unexpected error occurred while trying to send the card PIN.',
                    },
                },
            },
        },
    ];
}
