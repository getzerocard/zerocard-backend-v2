import { ApiDocs } from '@/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class ActivateCardResponseDto {
  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;

  @ApiProperty({
    example: {
      id: 'card_123',
      customerId: 'customer_123',
      brand: 'VISA',
      currency: 'NGN',
      expiryMonth: '12',
      expiryYear: '2028',
      status: 'active',
    },
    description: 'Activated card information',
  })
  data: {
    id: string;
    customerId: string;
    brand: string;
    currency: string;
    expiryMonth: string;
    expiryYear: string;
    status: string;
  };
}

class ErrorResponseDto {
  @ApiProperty({ example: 'error', description: 'Response status' })
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

class GetUserCardResponseDto {
  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;

  @ApiProperty({
    example: {
      id: 'card_123',
      customerId: 'customer_123',
      brand: 'VISA',
      currency: 'NGN',
      expiryMonth: '12',
      expiryYear: '2028',
      status: 'active',
    },
    description: 'User card information',
  })
  data: {
    id: string;
    customerId: string;
    brand: string;
    currency: string;
    expiryMonth: string;
    expiryYear: string;
    status: string;
  };
}

class GetCardTokenResponseDto {
  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;

  @ApiProperty({
    example: {
      token: 'tok_1234567890abcdef',
      expiresAt: '2024-12-31T23:59:59Z',
    },
    description: 'Card token information',
  })
  data: {
    token: string;
    expiresAt: string;
  };
}

class UpdateCardStatusResponseDto {
  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;

  @ApiProperty({
    example: {
      id: 'card_123',
      status: 'inactive',
      updatedAt: '2024-06-15T12:00:00Z',
    },
    description:
      'Updated card status information. Status can be "inactive" (frozen) or "active" (unfrozen).',
  })
  data: {
    id: string;
    status: 'active' | 'inactive';
    updatedAt: string;
  };
}

export const CardSwagger = {
  create: ApiDocs(),
  activate: ApiDocs(
    ApiOperation({
      summary: 'Activate a card',
      description: `Activates a card for the authenticated user.`,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Card activated successfully',
      type: ActivateCardResponseDto,
      schema: {
        example: {
          status: 'success',
          data: {
            id: 'card_123',
            customerId: 'customer_123',
            brand: 'VISA',
            currency: 'NGN',
            expiryMonth: '12',
            expiryYear: '2028',
            status: 'active',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User is not authenticated',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Unauthorized',
            errorType: 'AuthenticationError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),
  getUserCard: ApiDocs(
    ApiOperation({
      summary: 'Get user card',
      description: `Retrieves the card information for the authenticated user.\n\nRequires authentication via JWT token in Authorization header.`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Card retrieved successfully',
      type: GetUserCardResponseDto,
      schema: {
        example: {
          status: 'success',
          data: {
            id: 'card_123',
            customerId: 'customer_123',
            brand: 'VISA',
            currency: 'NGN',
            expiryMonth: '12',
            expiryYear: '2028',
            status: 'active',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User is not authenticated',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Unauthorized',
            errorType: 'AuthenticationError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Card not found',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Card not found',
            errorType: 'NotFoundError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),
  getCardToken: ApiDocs(
    ApiOperation({
      summary: 'Get card token',
      description: `Retrieves a token for the authenticated user's card.\n\nRequires authentication via JWT token in Authorization header.`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Card token retrieved successfully',
      type: GetCardTokenResponseDto,
      schema: {
        example: {
          status: 'success',
          data: {
            token: 'tok_1234567890abcdef',
            expiresAt: '2024-12-31T23:59:59Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User is not authenticated',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Unauthorized',
            errorType: 'AuthenticationError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Card not found',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Card not found',
            errorType: 'NotFoundError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),
  updateStatus: ApiDocs(
    ApiOperation({
      summary: 'Update card status (freeze/unfreeze)',
      description: `Updates the status of the authenticated user's card.\n\n- Use \"inactive\" to freeze the card.\n- Use \"active\" to unfreeze the card.\n\nRequires authentication via JWT token in Authorization header.`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Card status updated successfully',
      type: UpdateCardStatusResponseDto,
      schema: {
        examples: {
          frozen: {
            summary: 'Card frozen',
            value: {
              status: 'success',
              data: {
                id: 'card_123',
                status: 'inactive',
                updatedAt: '2024-06-15T12:00:00Z',
              },
            },
          },
          unfrozen: {
            summary: 'Card unfrozen',
            value: {
              status: 'success',
              data: {
                id: 'card_123',
                status: 'active',
                updatedAt: '2024-06-15T12:05:00Z',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User is not authenticated',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Unauthorized',
            errorType: 'AuthenticationError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Card not found',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Card not found',
            errorType: 'NotFoundError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),
};
