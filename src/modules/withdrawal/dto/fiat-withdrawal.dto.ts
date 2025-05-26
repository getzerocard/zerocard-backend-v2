import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumberString, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class RecipientDetailsDto {
    @ApiProperty({ description: 'Account identifier (e.g., bank account number)', example: '0123456789' })
    @IsString()
    @IsNotEmpty()
    accountIdentifier: string;

    @ApiProperty({ description: 'Name of the account holder', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    accountName: string;

    @ApiProperty({ description: 'Institution code or identifier (e.g., bank code)', example: '058' })
    @IsString()
    @IsNotEmpty()
    institution: string;

    @ApiProperty({ description: 'Memo or reference for the transaction', example: 'Payment for services' })
    @IsString()
    @IsOptional()
    memo?: string;
}

export class FiatWithdrawalDto {
    @ApiProperty({
        description: 'Type of blockchain (ethereum or solana)',
        enum: ['ethereum', 'solana'],
        example: 'ethereum',
        required: true,
    })
    @IsEnum(['ethereum', 'solana'])
    @IsNotEmpty()
    chainType: 'ethereum' | 'solana';

    @ApiProperty({
        description: 'Token symbol (e.g., USDC)',
        example: 'USDC',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    tokenSymbol: string;

    @ApiProperty({
        description: 'Amount of tokens to offramp',
        example: '50.25',
        required: true,
    })
    @IsNumberString()
    @IsNotEmpty()
    amount: string;

    @ApiProperty({
        description: 'Fiat currency code (e.g., NGN)',
        example: 'NGN',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    fiat: string;

    @ApiProperty({
        description: 'Recipient information for offramp',
        type: RecipientDetailsDto,
        required: true,
    })
    @ValidateNested()
    @Type(() => RecipientDetailsDto)
    @IsNotEmpty()
    recipientDetails: RecipientDetailsDto;

    @ApiProperty({
        description: 'Optional specific blockchain network name (e.g., BNB Smart Chain, Base)',
        example: 'Base',
        required: false,
    })
    @IsString()
    @IsOptional()
    blockchainNetwork?: string;
}

export class FiatWithdrawalResponseDto {
    @ApiProperty({
        description: 'Order ID from the offramp service',
        example: 'order_123xyz',
    })
    orderId: string;

    @ApiProperty({
        description: 'Status data from the offramp service',
        example: {
            OrderID: 'order_123xyz',
            Amount: '50.25',
            Token: 'USDC',
            Status: 'Pending',
            TxHash: '0x...',
        },
    })
    statusData: {
        OrderID: string;
        Amount: string;
        Token: string;
        Status: string;
        TxHash: string;
        Rate?: string;
    };
}

export class FiatWithdrawalErrorResponses {
    static readonly R400_BAD_REQUEST = {
        status: 400,
        description: 'Bad Request - Invalid input data or parameters.',
        examples: {
            invalidInput: {
                summary: 'Invalid Input',
                value: { statusCode: 400, success: false, message: 'Invalid input: [details of validation error]' },
            },
            userNotFound: {
                summary: 'User Not Found', // This was in the DTO, but NotFoundException is usually 404. Keeping as per DTO.
                value: { statusCode: 400, success: false, message: 'User with ID xyz not found' },
            },
            walletNotFound: {
                summary: 'Wallet Not Found',
                value: { statusCode: 400, success: false, message: 'Wallet address not found for user xyz' },
            },
            insufficientBalance: {
                summary: 'Insufficient Balance',
                value: { statusCode: 400, success: false, message: 'Insufficient balance for withdrawal.' },
            },
            configError: { // This was in DTO, but InternalServerErrorException is usually 500. Keeping as per DTO.
                summary: 'Configuration Error',
                value: { statusCode: 400, success: false, message: 'Network type is not properly configured' },
            }
        },
    };

    static readonly R401_UNAUTHORIZED = {
        status: 401,
        description: 'Unauthorized - Sub-users are not allowed to make withdrawals or invalid credentials.',
        examples: {
            subUserWithdrawal: {
                summary: 'Sub-user Withdrawal Attempt',
                value: { statusCode: 401, success: false, message: 'Sub-users are not allowed to make withdrawals' },
            },
        },
    };

    static readonly R404_NOT_FOUND = { // Added for consistency if user/wallet not found leads to 404
        status: 404,
        description: 'Not Found - Resource not found.',
        examples: {
            userNotFound: {
                summary: 'User Not Found',
                value: { statusCode: 404, success: false, message: 'User with ID xyz not found' },
            },
        },
    };

    static readonly R500_INTERNAL_SERVER_ERROR = {
        status: 500,
        description: 'Internal Server Error - An unexpected error occurred.',
        examples: {
            default: {
                summary: 'Internal Error',
                value: { statusCode: 500, success: false, message: 'Internal server error' },
            },
            configError: {
                summary: 'Configuration Error',
                value: { statusCode: 500, success: false, message: 'Network type is not properly configured' },
            }
        },
    };
}
