import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty, getSchemaPath, ApiPropertyOptional } from '@nestjs/swagger';
import { Response } from '../../../common/interceptors/response.interceptor';
import { HttpStatus } from '@nestjs/common';
import { Type } from 'class-transformer';

/**
 * Conceptual Input DTO for mapping a card (parameters are via @Query).
 * This helps in documenting the expected query parameters for Swagger.
 */
export class MapCardInputDto {
  @ApiProperty({
    description: 'User ID associated with the card',
    example: 'did:privy:user12345',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Status of the card mapping', example: 'active' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Expiration date of the card in MMM-YYYY format (e.g., AUG-2025)',
    example: 'AUG-2025',
  })
  @IsString()
  @IsNotEmpty()
  expirationDate: string;

  @ApiProperty({ description: 'Card number', example: '1234567890123456' })
  @IsString()
  @IsNotEmpty()
  number: string;
}

// Sub-DTOs for ProviderCardDataDto
class ProviderCardMetadataDto {
  @ApiProperty({ example: 'did:privy:cm94fwojw01yri50l74zvnkr5' })
  @IsString()
  user_id: string;
}

class ProviderCardSpendingControlsChannelsDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  atm: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  pos: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  web: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  mobile: boolean;
}

class ProviderCardSpendingControlsLimitDto {
  @ApiProperty({ example: 100000000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'daily' })
  @IsString()
  interval: string;

  @ApiPropertyOptional({ type: [String], example: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];
}

class ProviderCardSpendingControlsDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ProviderCardSpendingControlsChannelsDto)
  channels: ProviderCardSpendingControlsChannelsDto;

  @ApiProperty({ type: [String], example: ['3835', '3412'] })
  @IsArray()
  @IsString({ each: true })
  allowedCategories: string[];

  @ApiProperty({ type: [String], example: ['zerocard'] })
  @IsArray()
  @IsString({ each: true })
  blockedCategories: string[];

  @ApiProperty({ type: [ProviderCardSpendingControlsLimitDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderCardSpendingControlsLimitDto)
  spendingLimits: ProviderCardSpendingControlsLimitDto[];
}

/**
 * Represents the detailed card data from the provider.
 * This is the innermost 'data' object in the successful response.
 */
export class ProviderCardDataDto {
  @ApiProperty({ example: '67ee7a73730ffcefbcdb7c8d' })
  @IsString()
  business: string;

  @ApiProperty({ example: '68260692331a6186aac89441' })
  @IsString()
  customer: string;

  @ApiProperty({ example: '68359f38cb8e3c2f03c42824' })
  @IsString()
  account: string;

  @ApiProperty({ example: '67ee7a73730ffcefbcdb7c94' })
  @IsString()
  fundingSource: string;

  @ApiProperty({ example: 'physical' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Verve' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'NGN' })
  @IsString()
  currency: string;

  @ApiProperty({ example: '506321*********5494' })
  @IsString()
  maskedPan: string;

  @ApiProperty({ example: '05' })
  @IsString()
  expiryMonth: string;

  @ApiProperty({ example: '2028' })
  @IsString()
  expiryYear: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ProviderCardMetadataDto)
  metadata: ProviderCardMetadataDto;

  @ApiProperty({ example: 'active' })
  @IsString()
  status: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ProviderCardSpendingControlsDto)
  spendingControls: ProviderCardSpendingControlsDto;

  @ApiProperty({ example: false })
  @IsBoolean()
  is2FAEnrolled: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isDigitalized: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({ example: '2025-05-27T11:17:13.009Z' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ example: '2025-05-27T11:17:13.009Z' })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({ example: '68359f39cb8e3c2f03c42826' })
  @IsString()
  _id: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  __v: number;
}

/**
 * Represents the actual data structure returned by the mapCardService.mapCard method.
 * This is what the controller's mapCard method will return, and it will be
 * placed inside the 'data' field of the standard ResponseInterceptor wrapper.
 */
export class MapCardServiceDataDto {
  @ApiProperty({ description: 'Status of the service operation', example: 'success' })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Message from the service operation',
    example: 'Card mapped successfully.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Detailed card data from the provider',
    type: ProviderCardDataDto,
  })
  @ValidateNested()
  @Type(() => ProviderCardDataDto)
  data: ProviderCardDataDto;
}

// Success Response Definition for Swagger
export class MapCardSuccess {
  static readonly R200 = {
    status: 200,
    description: 'Card mapped successfully to the user.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(Response) }, // This is the outer {statusCode, success, message, data}
        {
          properties: {
            data: { $ref: getSchemaPath(MapCardServiceDataDto) }, // MapCardServiceDataDto goes into the 'data' field
          },
        },
      ],
    },
    examples: {
      success: {
        summary: 'Successful Card Mapping',
        value: { // This is the full final response structure
          statusCode: 200,
          success: true,
          message: 'Operation successful', // Interceptor's message
          data: { // This is an instance of MapCardServiceDataDto
            status: 'success',
            message: 'Card mapped successfully.',
            data: { // This is an instance of ProviderCardDataDto
              business: "67ee7a73730ffcefbcdb7c8d",
              customer: "68260692331a6186aac89441",
              account: "68359f38cb8e3c2f03c42824",
              fundingSource: "67ee7a73730ffcefbcdb7c94",
              type: "physical",
              brand: "Verve",
              currency: "NGN",
              maskedPan: "506321*********5494",
              expiryMonth: "05",
              expiryYear: "2028",
              metadata: {
                user_id: "did:privy:cm94fwojw01yri50l74zvnkr5"
              },
              status: "active",
              spendingControls: {
                channels: {
                  atm: true,
                  pos: true,
                  web: true,
                  mobile: true
                },
                allowedCategories: ["3835", "3412"], // Truncated for brevity in example
                blockedCategories: ["zerocard"],
                spendingLimits: [{
                  amount: 100000000,
                  interval: "daily",
                  categories: []
                }]
              },
              is2FAEnrolled: false,
              isDigitalized: false,
              isDeleted: false,
              createdAt: "2025-05-27T11:17:13.009Z",
              updatedAt: "2025-05-27T11:17:13.009Z",
              _id: "68359f39cb8e3c2f03c42826",
              __v: 0
            }
          }
        },
      },
    },
  };
}

// Error Responses Definition for Swagger
export class MapCardErrors {
  static readonly R400 = {
    status: 400,
    description: 'Bad Request - Invalid input parameters or validation issues.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(Response) },
        {
          properties: {
            message: { type: 'string' },
          },
        },
      ],
    },
    examples: {
      invalidUserId: {
        summary: 'Invalid User ID',
        value: {
          statusCode: 400,
          success: false,
          message: 'User ID is required for card mapping',
        },
      },
      missingCustomerId: {
        summary: 'Missing Customer Account ID',
        value: {
          statusCode: 400,
          success: false,
          message: 'Customer account ID not found. Please verify the user account details with support.',
        },
      },
    },
  };

  static readonly R403 = {
    status: 403,
    description: 'Forbidden - User does not have permission to map the card (e.g., main user mapping to sub-user account incorrectly).'
    ,
    schema: {
      allOf: [
        { $ref: getSchemaPath(Response) },
        {
          properties: {
            message: { type: 'string' },
          },
        },
      ],
    },
    examples: {
      mappingViolation: {
        summary: 'Mapping Permission Violation',
        value: {
          statusCode: 403,
          success: false,
          message: 'Sub users can only map cards to sub user accounts. Please check the account mapping.',
        },
      },
    },
  };

  static readonly R404 = {
    status: 404,
    description: 'Not Found - User associated with the userId not found.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(Response) },
        {
          properties: {
            message: { type: 'string' },
          },
        },
      ],
    },
    examples: {
      userNotFound: {
        summary: 'User Not Found',
        value: {
          statusCode: 404,
          success: false,
          message: 'User not found. Please ensure the user ID is correct and try again.',
        },
      },
    },
  };

  static readonly R500 = {
    status: 500,
    description: 'Internal Server Error - Unexpected issues during card mapping process.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(Response) },
        {
          properties: {
            message: { type: 'string' },
          },
        },
      ],
    },
    examples: {
      internalError: {
        summary: 'Internal Server Error',
        value: {
          statusCode: 500,
          success: false,
          message: 'An unexpected error occurred during card mapping. Please try again later or contact support.',
        },
      },
    },
  };

  static readonly R409 = {
    status: 409,
    description: 'Conflict - Card already linked to user',
    schema: {
      allOf: [
        { $ref: getSchemaPath(Response) },
        {
          properties: {
            message: { type: 'string' },
          },
        },
      ],
    },
    examples: {
      cardConflict: {
        summary: 'Card Already Linked',
        value: {
          statusCode: 409,
          success: false,
          message: 'Card Protocol: Card already linked to this user profile.',
        },
      },
    },
  };
}
