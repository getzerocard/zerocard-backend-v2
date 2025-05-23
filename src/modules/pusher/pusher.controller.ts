import { Body, Post, HttpStatus, Logger, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PusherService } from './pusher.service';
import { PusherChannelsAuthRequestDto, PusherChannelsAuthResponseDto, PusherChannelsAuthErrorResponses } from './dto/pusher.dto';
import { PrivyUser } from '../auth/decorators/privy-user.decorator';
import type { PrivyUserData } from '../auth/interfaces/privy-user.interface';
import { ApiController } from '../../common/decorators/api-controller.decorator';
import { PrivyService } from '../auth/privy.service';
import { ApiStandardResponse } from '../../common/decorators/api-response.decorator';

@ApiController('pusher', 'Pusher')
export class PusherController {
    private readonly logger = new Logger(PusherController.name);

    constructor(
        private readonly pusherService: PusherService,
        private readonly privyService: PrivyService
    ) { }

    @Post('channels-auth')
    @ApiOperation({ summary: 'Authorize private channel subscriptions in batch' })
    @ApiStandardResponse(PusherChannelsAuthResponseDto)
    @ApiBody({ type: PusherChannelsAuthRequestDto })
    @ApiResponse(PusherChannelsAuthErrorResponses.definitions[0])
    @ApiResponse(PusherChannelsAuthErrorResponses.definitions[1])
    @ApiResponse(PusherChannelsAuthErrorResponses.definitions[2])
    async authorizeChannels(
        @Body(new ValidationPipe()) body: PusherChannelsAuthRequestDto,
        @PrivyUser() privyUser: PrivyUserData,
    ): Promise<PusherChannelsAuthResponseDto> {
        this.logger.log(`Authorizing channels for user ${privyUser.userId}, channels: ${body.channel_names.join(', ')}`);

        if (!privyUser?.userId) {
            throw new UnauthorizedException('Authentication required for channel authorization.');
        }

        const channelAuthStatuses: Record<string, { status: number; data?: any; message?: string }> = {};

        for (const channelName of body.channel_names) {
            try {
                const channelPattern = /^private-(ethereum|solana)-([a-zA-Z0-9]{30,})$/;
                const match = channelName.match(channelPattern);

                if (!match) {
                    this.logger.warn(`Invalid channel format: ${channelName} for user ${privyUser.userId}`);
                    channelAuthStatuses[channelName] = {
                        status: HttpStatus.BAD_REQUEST,
                        message: 'Invalid channel name format. Expected private-<chainType>-<walletAddress>.',
                    };
                    continue;
                }

                const [, parsedChainType, parsedWalletAddress] = match;
                const chainType = parsedChainType as 'ethereum' | 'solana';

                this.logger.debug(`Validating ownership for channel: ${channelName}, user: ${privyUser.userId}, chain: ${chainType}, address: ${parsedWalletAddress}`);

                const userWallets = await this.privyService.getWalletId(privyUser.userId, chainType);
                const isOwner = userWallets.some(w => w.address.toLowerCase() === parsedWalletAddress.toLowerCase());

                if (!isOwner) {
                    this.logger.warn(`User ${privyUser.userId} not authorized for channel ${channelName}. Wallet ${parsedWalletAddress} not found or not owned on ${chainType}.`);
                    channelAuthStatuses[channelName] = {
                        status: HttpStatus.FORBIDDEN,
                        message: 'Access to this channel denied - wallet not linked or not owned for the specified chain type.',
                    };
                    continue;
                }

                const authResponseData = this.pusherService.authorizeChannel(body.socket_id, channelName);
                this.logger.log(`Successfully authorized channel ${channelName} for user ${privyUser.userId}`);
                channelAuthStatuses[channelName] = {
                    status: HttpStatus.OK,
                    data: authResponseData,
                };

            } catch (error: any) {
                this.logger.error(`Error authorizing channel ${channelName} for user ${privyUser.userId}: ${error.message}`, error.stack);
                channelAuthStatuses[channelName] = {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message || 'Internal server error during specific channel authorization.',
                };
            }
        }
        return { channel_authorizations: channelAuthStatuses };
    }
}
