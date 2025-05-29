import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum } from 'class-validator';

/**
 * DTO for updating card details request
 */
export class UpdateCardRequestDto {
    @ApiProperty({
        description: 'The new status of the card',
        example: 'active',
        enum: ['active', 'inactive'],
    })
    @IsEnum(['active', 'inactive'])
    status: 'active' | 'inactive';

    @ApiProperty({
        description: 'The daily spending limit amount for the card',
        example: 1000,
    })
    @IsNumber()
    dailyLimitAmount: number;
}

/**
 * DTO for update card response data
 */
export class UpdateCardResponseDto {
    @ApiProperty({
        description: 'Status code of the response',
        example: 200,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Message describing the result',
        example: 'Card updated successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Updated card data',
        type: 'object',
        additionalProperties: true,
    })
    data: any;
}

/**
 * Error responses for update card endpoint
 */
export class UpdateCardErrorResponses {
    static R400_BAD_REQUEST = {
        status: 400,
        description: 'Bad Request - Missing or invalid parameters',
        examples: {
            missingParams: {
                summary: 'Missing required parameters',
                value: { statusCode: 400, success: false, message: 'Status and daily limit amount are required.' },
            },
        },
    };

    static R401_UNAUTHORIZED = {
        status: 401,
        description: 'Unauthorized - Authentication required',
        examples: {
            unauthorized: {
                summary: 'Unauthorized access',
                value: { statusCode: 401, success: false, message: 'Unauthorized' },
            },
        },
    };

    static R404_NOT_FOUND = {
        status: 404,
        description: 'Not Found - User or card not found',
        examples: {
            notFound: {
                summary: 'User or card not found',
                value: { statusCode: 404, success: false, message: 'User with ID user123 not found' },
            },
        },
    };

    static R500_INTERNAL_SERVER_ERROR = {
        status: 500,
        description: 'Internal Server Error - Unexpected server error',
        examples: {
            serverError: {
                summary: 'Server error',
                value: { statusCode: 500, success: false, message: 'Failed to update card: Unknown internal error' },
            },
        },
    };
}
