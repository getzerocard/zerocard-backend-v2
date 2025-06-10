import { HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiDocs } from '@/common/decorators';
import { SendMfaDto, VerifyMfaDto, ToggleMfaDto } from '../dtos';

export const MfaSwagger = {
  send: ApiDocs(
    ApiOperation({
      summary: 'Send MFA token',
      description:
        "Sends a one-time password (OTP) to the user's email for MFA verification. The token is valid for 10 minutes.",
    }),
    ApiBody({
      type: SendMfaDto,
      description: 'MFA token request data including the context (login or toggle-mfa)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'MFA token sent successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'MFA token sent' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid request data',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  ),

  verify: ApiDocs(
    ApiOperation({
      summary: 'Verify MFA token',
      description:
        "Verifies the MFA token sent to the user's email. The token must be verified within 10 minutes of being sent.",
    }),
    ApiBody({
      type: VerifyMfaDto,
      description: 'MFA verification data including the context and token',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'MFA token verified successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'MFA token verified' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid or expired MFA token',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid or expired MFA token' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid request data',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  ),

  toggle: ApiDocs(
    ApiOperation({
      summary: 'Toggle MFA status',
      description:
        "Enables or disables two-factor authentication for the user's account. When enabling MFA, a verification token will be sent to the user's email.",
    }),
    ApiBody({
      type: ToggleMfaDto,
      description: 'MFA toggle request data including whether to enable or disable MFA',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'MFA status updated successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'MFA status updated successfully' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid request data',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  ),
};
