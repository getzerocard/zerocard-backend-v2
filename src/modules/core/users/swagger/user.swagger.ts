import { ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UpdateUniqueNameDto, UpdateAddressDto } from '../dtos';
import { ApiDocs } from '@/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

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

class UserProfileResponseDto extends SuccessResponseDto {
  @ApiProperty({
    example: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://example.com/avatar.jpg',
      uniqueName: 'john_doe_123',
      walletsGenerated: true,
      completedKyc: true,
    },
    description: 'User profile information',
  })
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    uniqueName: string | null;
    walletsGenerated: boolean;
    completedKyc: boolean;
  };
}

class UniqueNameAvailabilityResponseDto extends SuccessResponseDto {
  @ApiProperty({
    example: {
      available: true,
      message: 'Username is available',
    },
    description: 'Unique name availability information',
  })
  data: {
    available: boolean;
    message: string;
  };
}

export const UserSwagger = {
  me: ApiDocs(
    ApiOperation({
      summary: 'Get user profile',
      description: `Retrieves the profile information of the currently authenticated user.
      
      This endpoint will:
      1. Fetch the complete user profile information
      2. Return the user's profile data
      
      Requires authentication via JWT token in Authorization header.`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User profile retrieved successfully',
      type: UserProfileResponseDto,
      schema: {
        example: {
          status: 'success',
          user: {
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg',
            uniqueName: 'john_doe_123',
            walletsGenerated: true,
            completedKyc: true,
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

  checkUniqueName: ApiDocs(
    ApiOperation({
      summary: 'Check unique name availability',
      description: `Checks if a unique name (username) is available for use.
      
      This endpoint will:
      1. Validate the unique name format
      2. Check if the unique name is already taken
      3. Return availability status
      
      The unique name must be:
      - Valid string format
      - Not already taken by another user
      
      This endpoint is useful for checking username availability before attempting to update.`,
    }),
    ApiQuery({
      name: 'uniqueName',
      description: 'The unique name to check for availability',
      required: true,
      type: String,
      examples: {
        available: {
          summary: 'Available Username',
          description: 'A username that is available',
          value: 'john_doe_123',
        },
        taken: {
          summary: 'Taken Username',
          description: 'A username that is already taken',
          value: 'existing_user',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Unique name availability check completed',
      type: UniqueNameAvailabilityResponseDto,
      schema: {
        examples: {
          available: {
            summary: 'Username Available',
            value: {
              status: 'success',
              data: {
                available: true,
                message: 'Username is available',
              },
            },
          },
          taken: {
            summary: 'Username Taken',
            value: {
              status: 'success',
              data: {
                available: false,
                message: 'Username is already taken',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid unique name format',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Invalid unique name format',
            errorType: 'ValidationError',
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

  updateUniqueName: ApiDocs(
    ApiOperation({
      summary: 'Update unique name',
      description: `Updates the unique name (username) of the authenticated user.
      
      This endpoint will:
      1. Validate the requested unique name
      2. Check if the unique name is available
      3. Update the user's unique name if available
      
      The unique name must be:
      - Unique across all users
      - Not already taken
      - Valid string format
      
      Requires authentication via JWT token in Authorization header.`,
    }),
    ApiBody({
      type: UpdateUniqueNameDto,
      description: 'New unique name for the user',
      examples: {
        validName: {
          summary: 'Valid Unique Name',
          description: 'A unique name that is available',
          value: {
            uniqueName: 'john_doe_123',
          },
        },
        takenName: {
          summary: 'Taken Unique Name',
          description: 'A unique name that is already taken',
          value: {
            uniqueName: 'existing_user',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Unique name updated successfully',
      type: UserProfileResponseDto,
      schema: {
        example: {
          status: 'success',
          user: {
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg',
            uniqueName: 'john_doe_123',
            walletsGenerated: true,
            completedKyc: true,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid unique name or name already taken',
      type: ErrorResponseDto,
      schema: {
        examples: {
          invalidName: {
            summary: 'Invalid Unique Name',
            value: {
              status: 'error',
              error: {
                message: 'Invalid unique name format',
                errorType: 'ValidationError',
              },
            },
          },
          takenName: {
            summary: 'Name Already Taken',
            value: {
              status: 'error',
              error: {
                message: 'This unique name is already taken',
                errorType: 'ValidationError',
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
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),

  updateAddress: ApiDocs(
    ApiOperation({
      summary: 'Update user address',
      description: `Updates the address information of the authenticated user.
      
      This endpoint will:
      1. Validate the address information
      2. Update the user's address details
      
      The address must include:
      - Street address
      - City
      - State
      - Postal code (optional)
      
      Requires authentication via JWT token in Authorization header.`,
    }),
    ApiBody({
      type: UpdateAddressDto,
      description: 'New address information for the user',
      examples: {
        validAddress: {
          summary: 'Valid Address',
          description: 'A complete address with all fields',
          value: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
          },
        },
        minimalAddress: {
          summary: 'Minimal Address',
          description: 'An address without postal code',
          value: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Address updated successfully',
      type: UserProfileResponseDto,
      schema: {
        example: {
          status: 'success',
          user: {
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg',
            uniqueName: 'john_doe_123',
            walletsGenerated: true,
            completedKyc: true,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid address information',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Invalid address information',
            errorType: 'ValidationError',
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
