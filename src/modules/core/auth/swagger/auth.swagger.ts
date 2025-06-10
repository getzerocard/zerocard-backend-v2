import { HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ApiDocs } from '@/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { CompleteSignInDto, OAuthSigninDto, SignInDto } from '../dtos';

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

class AuthResponseDto extends SuccessResponseDto {
  @ApiProperty({
    example: 'session_12345',
    description: 'Unique session identifier',
  })
  sessionId: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for API authentication',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token for renewing access tokens',
  })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://example.com/avatar.jpg',
      uniqueName: 'john_doe_123',
    },
    description: 'User profile information',
  })
  user: object;
}

class UserCreationResponseDto extends SuccessResponseDto {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      firstName: null,
      lastName: null,
      avatar: null,
      uniqueName: null,
      createdAt: '2024-03-20T10:00:00.000Z',
      updatedAt: '2024-03-20T10:00:00.000Z',
    },
    description: 'Created or existing user information',
  })
  user: object;

  @ApiProperty({
    example: 'MFA token sent to your email',
    description: 'Success message confirming MFA token was sent',
  })
  message: string;
}

export const AuthSwagger = {
  signin: ApiDocs(
    ApiOperation({
      summary: 'Initiate signin process',
      description: `Start the authentication process with email. The system will:
      1. Create a new user if the email doesn't exist
      2. Send an OTP to the provided email address
      3. Return user information and confirmation message

      This is the first step in the passwordless authentication flow.`,
    }),
    ApiBody({
      type: SignInDto,
      description: 'Email address for signin',
      examples: {
        newUser: {
          summary: 'New User Signin',
          description: 'Email that will create a new account',
          value: {
            email: 'newuser@example.com',
          },
        },
        existingUser: {
          summary: 'Existing User Signin',
          description: 'Email for an existing account',
          value: {
            email: 'john.doe@example.com',
          },
        },
        invalidEmail: {
          summary: 'Invalid Email Format',
          description: 'Will return validation error',
          value: {
            email: 'invalid-email-format',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'MFA token sent successfully',
      type: UserCreationResponseDto,
      schema: {
        example: {
          status: 'success',
          message: 'MFA token sent to your email',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: null,
            lastName: null,
            avatar: null,
            uniqueName: null,
            createdAt: '2024-03-20T10:00:00.000Z',
            updatedAt: '2024-03-20T10:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid email format',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'email must be an email',
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

  completeSignin: ApiDocs(
    ApiOperation({
      summary: 'Complete signin with OTP',
      description: `Complete the authentication process by verifying the OTP sent to the user's email.
      
      This endpoint will:
      1. Verify the OTP for the provided email
      2. Create a new user session with device fingerprinting
      3. Generate JWT access and refresh tokens
      4. Return complete authentication response
      
      The OTP expires after 10 minutes and can only be used once.`,
    }),
    ApiBody({
      type: CompleteSignInDto,
      description: 'Email and OTP verification code',
      examples: {
        validSignin: {
          summary: 'Valid OTP',
          description: 'Successful signin completion',
          value: {
            email: 'john.doe@example.com',
            code: '123456',
          },
        },
        invalidCode: {
          summary: 'Invalid OTP',
          description: 'Wrong or expired OTP',
          value: {
            email: 'john.doe@example.com',
            code: '000000',
          },
        },
        expiredCode: {
          summary: 'Expired OTP',
          description: 'OTP that has expired (>10 minutes old)',
          value: {
            email: 'john.doe@example.com',
            code: '987654',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Authentication successful',
      type: AuthResponseDto,
      schema: {
        example: {
          status: 'success',
          sessionId: 'session_12345',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg',
            uniqueName: 'john_doe_123',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials or OTP',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          error: {
            message: 'Invalid credentials',
            errorType: 'AuthenticationError',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  ),

  oauth: ApiDocs(
    ApiOperation({
      summary: 'OAuth authentication',
      description: `Authenticate using OAuth providers (Google or Apple).
      
      This endpoint will:
      1. Validate the OAuth ID token with the provider
      2. Extract user information from the OAuth response
      3. Create a new user if they don't exist, or link to existing user
      4. Validate OAuth provider connections for existing users
      5. Create a new user session and return authentication tokens
      
      Supported providers: google, apple`,
    }),
    ApiParam({
      name: 'provider',
      description: 'OAuth provider name',
      enum: ['google', 'apple'],
      example: 'google',
    }),
    ApiBody({
      type: OAuthSigninDto,
      description: 'OAuth ID token from the provider',
      examples: {
        googleSignin: {
          summary: 'Google OAuth Signin',
          description: 'ID token received from Google OAuth flow',
          value: {
            idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyNzg5...',
          },
        },
        appleSignin: {
          summary: 'Apple OAuth Signin',
          description: 'ID token received from Apple OAuth flow',
          value: {
            idToken: 'eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ...',
          },
        },
        invalidToken: {
          summary: 'Invalid ID Token',
          description: 'Malformed or expired ID token',
          value: {
            idToken: 'invalid.token.here',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'OAuth authentication successful',
      type: AuthResponseDto,
      schema: {
        example: {
          status: 'success',
          sessionId: 'session_67890',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://lh3.googleusercontent.com/a/default-user',
            uniqueName: 'john_doe_456',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid OAuth token or user not connected to provider',
      type: ErrorResponseDto,
      schema: {
        examples: {
          invalidToken: {
            summary: 'Invalid OAuth Token',
            value: {
              status: 'error',
              error: {
                message: 'Failed to authenticate with provider',
                errorType: 'AuthenticationError',
              },
            },
          },
          userNotConnected: {
            summary: 'User Not Connected to Provider',
            value: {
              status: 'error',
              error: {
                message: 'User is not connected to this provider',
                errorType: 'AuthenticationError',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid provider or request data',
      type: ErrorResponseDto,
      schema: {
        examples: {
          invalidProvider: {
            summary: 'Invalid OAuth Provider',
            value: {
              status: 'error',
              error: {
                message: 'Invalid provider',
                errorType: 'ValidationError',
              },
            },
          },
          missingToken: {
            summary: 'Missing ID Token',
            value: {
              status: 'error',
              error: {
                message: 'idToken should not be empty',
                errorType: 'ValidationError',
              },
            },
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
