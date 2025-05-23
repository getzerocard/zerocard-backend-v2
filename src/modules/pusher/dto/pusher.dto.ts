import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty, ArrayMinSize, IsObject, IsInt, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

/**
 * @description DTO for requesting authorization for one or more Pusher channels.
 * The client (frontend) will send this payload to the `/pusher/channels-auth` endpoint.
 *
 * @example Frontend Usage (e.g., JavaScript/TypeScript)
 * ```javascript
 * async function authorizePusherChannels(socketId, channelsToAuthorize) {
 *   // channelsToAuthorize would be an array like:
 *   // [
 *   //   'private-ethereum-0xYourEthereumWalletAddress',
 *   //   'private-solana-YourSolanaWalletAddress'
 *   // ]
 *   const response = await fetch('/api/pusher/channels-auth', { // Assuming your API is at /api
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       // Include your authentication token (e.g., Bearer token) if required by AuthGuard
 *       'Authorization': `Bearer ${yourAuthToken}`,
 *     },
 *     body: JSON.stringify({
 *       socket_id: socketId,
 *       channel_names: channelsToAuthorize,
 *     }),
 *   });
 *
 *   if (!response.ok) {
 *     const errorData = await response.json();
 *     console.error('Pusher channel authorization failed overall:', errorData);
 *     // The errorData here would be the standard wrapped error if the whole request fails at controller entry
 *     // e.g. { statusCode: 401, success: false, message: "Authentication required..." }
 *     throw new Error('Failed to authorize Pusher channels');
 *   }
 *
 *   const wrappedSuccessData = await response.json(); // This is the standard wrapped response
 *   // wrappedSuccessData = {
 *   //   statusCode: 200,
 *   //   success: true,
 *   //   data: {
 *   //     "channel_authorizations": {
 *   //        "private-ethereum-0xYourEthereumWalletAddress": { "status": 200, "data": { "auth": "..." } },
 *   //        "private-solana-YourSolanaWalletAddress": { "status": 403, "message": "Access denied..." }
 *   //      }
 *   //    }
 *   // }
 *
 *   const authData = wrappedSuccessData.data.channel_authorizations;
 *   // authData will be an object where keys are channel names and values are their auth status/data
 *   return authData;
 * }
 * ```
 */
export class PusherChannelsAuthRequestDto {
    @ApiProperty({
        description: "The socket ID of the client connection, provided by the Pusher library on the frontend.",
        example: "123.456",
    })
    @IsString()
    @IsNotEmpty()
    socket_id: string;

    @ApiProperty({
        description: "An array of channel names the client wishes to subscribe to. Each channel name must follow the format: `private-<chainType>-<walletAddress>` where `<chainType>` is either \"ethereum\" or \"solana\".",
        example: ["private-ethereum-0x123abc...def", "private-solana-SolXYZ...123"],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @IsString({ each: true })
    channel_names: string[];
}

// --- Response DTOs for Swagger ---

class PusherChannelAuthStatusDataDto {
    @ApiProperty({ description: "The authorization string required by the Pusher client to subscribe to the channel.", example: "pusher_app_key:signature_string" })
    @IsString()
    auth: string;
}

class PusherChannelAuthStatusDto {
    @ApiProperty({ description: "HTTP status code for the authorization attempt of this specific channel.", example: 200 })
    @IsInt()
    status: number;

    @ApiPropertyOptional({ description: "Authorization data if successful.", type: PusherChannelAuthStatusDataDto })
    @IsOptional()
    @ValidateNested()
    data?: PusherChannelAuthStatusDataDto;

    @ApiPropertyOptional({ description: "Error message if authorization for this channel failed.", example: "Access to this channel denied." })
    @IsOptional()
    @IsString()
    message?: string;
}

/**
 * @description Represents the core data of a successful batch channel authorization response.
 * The keys are dynamic channel names, and values are their authorization status.
 */
export class PusherChannelsAuthResponseDto {
    @ApiProperty({
        description: "An object where each key is a channel name and the value contains its authorization status and data/message.",
        example: {
            "private-ethereum-0x123abcZYX": {
                status: 200,
                data: { auth: "some_app_key:some_signature_for_ethereum_channel" }
            },
            "private-solana-SoLAnAaDdReSs": {
                status: 403,
                message: "Access to this channel denied - wallet not linked or not owned for the specified chain type."
            }
        },
        // For objects with dynamic keys, `additionalProperties` is used in OpenAPI spec.
        // NestJS/Swagger might require a more specific type or a custom decorator for perfect generation.
        // A common way is to type it as Record<string, PusherChannelAuthStatusDto> or use a generic type.
        // For simplicity in DTO definition and class-validator, we often define it as an object if specific keys aren't known beforehand.
        // However, for Swagger to understand it as a map/dictionary, specific annotation might be needed if this doesn't render as expected.
        // We can represent this with `type: 'object', additionalProperties: { $ref: getSchemaPath(PusherChannelAuthStatusDto) }` in a raw @ApiResponse schema if needed.
        // For now, this provides a structural hint.
        type: 'object',
        additionalProperties: { oneOf: [{ $ref: '#/components/schemas/PusherChannelAuthStatusDto' }] }
    })
    @IsObject() // This validates it's an object, but not its internal structure deeply without more specific decorators or `Record` type.
    channel_authorizations: Record<string, PusherChannelAuthStatusDto>;
}

// --- Standard Error Response Definitions for Pusher Channels Auth ---
export class PusherChannelsAuthErrorResponses {
    static definitions = [
        {
            status: HttpStatus.BAD_REQUEST,
            description: 'Invalid request parameters (e.g., malformed channel name, missing socket_id or channel_names)',
            examples: {
                invalidFormat: {
                    summary: 'Invalid Channel Format',
                    value: { statusCode: HttpStatus.BAD_REQUEST, success: false, message: 'Invalid channel name format. Expected private-<chainType>-<walletAddress>.' },
                },
                missingSocketId: {
                    summary: 'Missing Socket ID',
                    value: { statusCode: HttpStatus.BAD_REQUEST, success: false, message: 'socket_id should not be empty' },
                },
                missingChannelNames: {
                    summary: 'Missing Channel Names',
                    value: { statusCode: HttpStatus.BAD_REQUEST, success: false, message: 'channel_names should not be empty' },
                }
            },
        },
        {
            status: HttpStatus.UNAUTHORIZED,
            description: 'User authentication failed (e.g., missing or invalid auth token). This error is for the overall request, not individual channel auth failure within the batch.',
            examples: {
                unauthenticated: {
                    summary: 'User Unauthenticated',
                    value: { statusCode: HttpStatus.UNAUTHORIZED, success: false, message: 'Authentication required for channel authorization.' },
                }
            }
        },
        {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            description: 'An unexpected error occurred on the server during the authorization process.',
            examples: {
                serverError: {
                    summary: 'Internal Server Error',
                    value: { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error during channel authorization.' },
                }
            }
        }
    ];
}
