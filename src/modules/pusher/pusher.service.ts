import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
    private pusher: Pusher;
    private readonly logger = new Logger(PusherService.name);

    constructor(private readonly configService: ConfigService) {
        const appId = this.configService.get<string>('pusher.appId');
        const key = this.configService.get<string>('pusher.key');
        const secret = this.configService.get<string>('pusher.secret');
        const cluster = this.configService.get<string>('pusher.cluster');
        const useTLS = this.configService.get<boolean>('pusher.useTLS', true); // Default to true

        if (!appId || !key || !secret || !cluster) {
            this.logger.error(
                'Pusher configuration is incomplete. Please check PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER in .env',
            );
            // Depending on strictness, you might throw an error here to prevent app startup
            // For now, it will log an error, and Pusher calls will likely fail.
        } else {
            this.pusher = new Pusher({
                appId,
                key,
                secret,
                cluster,
                useTLS,
            });
            this.logger.log('Pusher client initialized.');
        }
    }

    /**
     * Authorizes a private channel subscription
     * @param socketId The client's socket ID
     * @param channelName The channel name being subscribed to
     * @returns Pusher authorization response
     */
    authorizeChannel(socketId: string, channelName: string): any {
        if (!this.pusher) {
            this.logger.error('Pusher client not initialized');
            throw new Error('Pusher service unavailable');
        }

        try {
            this.logger.debug(`Authorizing channel: ${channelName} for socket: ${socketId}`);
            return this.pusher.authorizeChannel(socketId, channelName);
        } catch (error: any) {
            this.logger.error(`Channel authorization failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    // You can add other Pusher methods here, like trigger, authorizeChannel etc.
    // For example, a generic trigger method:
    async trigger(channel: string, event: string, data: any): Promise<any> {
        if (!this.pusher) {
            this.logger.error('Pusher client not initialized due to missing configuration.');
            // We should not throw here, as it might break critical flows if Pusher is optional
            // Instead, log the error and return a value indicating failure or skip.
            // For now, returning undefined, but a more specific error object could be used.
            return undefined;
        }
        try {
            this.logger.debug(`Triggering Pusher event. Channel: ${channel}, Event: ${event}`);
            const response = await this.pusher.trigger(channel, event, data);
            this.logger.debug('Pusher event triggered successfully.');
            return response;
        } catch (error: any) {
            this.logger.error(`Failed to trigger Pusher event on channel ${channel}, event ${event}: ${error.message}`, error.stack);
            // Re-throwing might be too disruptive for a notification.
            // Consider returning an error object or a specific status.
            // For now, re-throwing to make it visible, but this might need adjustment based on desired behavior.
            throw error;
        }
    }
}
