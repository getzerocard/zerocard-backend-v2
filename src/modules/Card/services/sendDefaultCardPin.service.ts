import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { sendCardDefaultPin } from '../infrastructureHandlers/sendCardDefaultPin.handler';
import type { SendDefaultPinDataDto } from '../dto/send-default-pin.dto';

@Injectable()
export class SendDefaultCardPinService {
    private readonly zerocardBaseUrl: string;
    private readonly zerocardAuthToken: string;
    private readonly logger = new Logger(SendDefaultCardPinService.name);

    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        this.zerocardBaseUrl = this.configService.get<string>(
            'card.ZEROCARD_API_URL',
        );
        this.zerocardAuthToken = this.configService.get<string>(
            'card.ZEROCARD_API_KEY',
        );
    }

    async sendDefaultPinByUserId(userId: string): Promise<SendDefaultPinDataDto> {
        this.logger.log(`Attempting to send default PIN for user: ${userId}`);

        if (!userId) {
            this.logger.warn('sendDefaultPinByUserId called without userId');
            throw new HttpException('User ID is required.', HttpStatus.BAD_REQUEST);
        }

        const user = await this.userRepository.findOne({ where: { userId } });

        if (!user) {
            this.logger.warn(`User not found for ID: ${userId}`);
            throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
        }

        if (!user.cardId) {
            this.logger.warn(`User ${userId} does not have a cardId.`);
            throw new HttpException(
                'User does not have a card associated.',
                HttpStatus.BAD_REQUEST,
            );
        }

        this.logger.log(`Found cardId: ${user.cardId} for user: ${userId}`);

        try {
            const handlerResponse = await sendCardDefaultPin(
                this.zerocardBaseUrl,
                this.zerocardAuthToken,
                user.cardId,
            );
            this.logger.log(
                `Successfully sent default PIN for cardId ${user.cardId}, user ${userId}. Response: ${JSON.stringify(handlerResponse)}`,
            );

            // Transform the response from the handler to SendDefaultPinDataDto
            if (handlerResponse.statusCode === 200 && handlerResponse.responseCode === '00') {
                return {
                    success: true,
                    message: handlerResponse.message || 'Default PIN sent successfully.',
                };
            } else {
                // If the handler didn't throw an error but response indicates failure
                this.logger.error(
                    `PIN sending failed with responseCode: ${handlerResponse.responseCode}, message: ${handlerResponse.message}`,
                );
                throw new HttpException(
                    handlerResponse.message || 'Failed to send PIN due to an unexpected provider response.',
                    // Try to use handlerResponse.statusCode if it makes sense, otherwise default
                    // This case should ideally be caught by the handler throwing an error for non-200s
                    typeof handlerResponse.statusCode === 'number' && handlerResponse.statusCode >= 400
                        ? handlerResponse.statusCode
                        : HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        } catch (error) {
            this.logger.error(
                `Failed to send default PIN for cardId ${user.cardId}, user ${userId}. Error: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            // The handler now throws HttpException, so we just re-throw it.
            if (error instanceof HttpException) {
                throw error;
            }
            // Fallback for any other unexpected errors
            throw new HttpException(
                'An unexpected error occurred while trying to send the card PIN.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
