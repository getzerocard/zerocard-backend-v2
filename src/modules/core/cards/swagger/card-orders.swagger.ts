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

class CardOrderResponseDto extends SuccessResponseDto {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      status: 'PENDING',
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z',
    },
    description: 'Card order information',
  })
  data: {
    id: string;
    userId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const CardOrdersSwagger = {
  orderCard: ApiDocs(
    ApiOperation({
      summary: 'Order a new card',
      description: `Creates a new card order for the authenticated user.
      
      This endpoint will:
      1. Create a new card order record
      2. Associate it with the authenticated user
      3. Return the order details
      
      The card order will be created with a PENDING status.
      A confirmation email will be sent to the user.
      
      Requires authentication via JWT token in Authorization header.`,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Card order created successfully',
      type: CardOrderResponseDto,
      schema: {
        example: {
          status: 'success',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            userId: '123e4567-e89b-12d3-a456-426614174001',
            status: 'PENDING',
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z',
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
};
