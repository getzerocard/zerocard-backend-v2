import { HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiDocs } from '@/common/decorators';
import { ApiProperty } from '@nestjs/swagger';

class SuccessResponseDto {
  @ApiProperty({
    example: 'success',
    description: 'Response status',
  })
  status: string;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Success message',
  })
  message?: string;
}

class ErrorResponseDto {
  @ApiProperty({
    example: 'error',
    description: 'Response status',
  })
  status: string;

  @ApiProperty({
    example: {
      message: 'Validation failed',
      errorType: 'ValidationError',
    },
    description: 'Error details',
  })
  error: {
    message: string;
    errorType: string;
  };
}

class TokenBalanceDto {
  @ApiProperty({
    example: 'usdc',
    description: 'Token symbol',
  })
  token: string;

  @ApiProperty({
    example: 10.5,
    description: 'Token balance',
  })
  balance: number;
}

class WalletAddressDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    description: 'Blockchain wallet address',
  })
  address: string;

  @ApiProperty({
    example: 'ethereum',
    description: 'Blockchain network/chain',
  })
  chain: string;

  @ApiProperty({
    type: [TokenBalanceDto],
    description: 'Array of token balances in the wallet',
  })
  balances: TokenBalanceDto[];
}

class WalletsResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: [WalletAddressDto],
    description: 'Array of wallet addresses with their balances',
  })
  wallets: WalletAddressDto[];
}

export const WalletsSwagger = {
  createWalletAddresses: ApiDocs(
    ApiOperation({
      summary: 'Create wallet addresses',
      description: `Creates new wallet addresses for the authenticated user.
      
      This endpoint will:
      1. Generate new wallet addresses for supported cryptocurrencies
      2. Associate the addresses with the user's account
      3. Return the created wallet addresses`,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Wallet addresses created successfully',
      type: WalletsResponseDto,
      schema: {
        example: {
          status: 'success',
          wallets: [
            {
              address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              chain: 'ethereum',
              balances: [
                {
                  token: 'usdc',
                  balance: 10.5,
                },
              ],
            },
            {
              address: '57NYmAhwDv7zHeM1Y6fZMk5t979g7NLBdY3kmehtMMgg',
              chain: 'solana',
              balances: [],
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User is not authenticated',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),

  getWallets: ApiDocs(
    ApiOperation({
      summary: 'Get user wallets',
      description: `Retrieves all wallet addresses associated with the authenticated user.
      
      This endpoint will:
      1. Fetch all wallet addresses for the user
      2. Return the list of wallet addresses with their associated cryptocurrencies and balances`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Wallet addresses retrieved successfully',
      type: WalletsResponseDto,
      schema: {
        example: {
          status: 'success',
          wallets: [
            {
              address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              chain: 'ethereum',
              balances: [
                {
                  token: 'usdc',
                  balance: 10.5,
                },
              ],
            },
            {
              address: '57NYmAhwDv7zHeM1Y6fZMk5t979g7NLBdY3kmehtMMgg',
              chain: 'solana',
              balances: [],
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User is not authenticated',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),
};
