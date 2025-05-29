import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { updateCard } from '../infrastructureHandlers/updateCard.handler';
import { allowedCategories } from '../infrastructureHandlers/allowedCategories.handler';
import { UpdateCardResponseDto } from '../dto/update-card.dto';

@Injectable()
export class UpdateCardService {
    private readonly logger = new Logger(UpdateCardService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Updates the details of a user's card.
     * @param userId - The ID of the user whose card needs to be updated.
     * @param status - The new status of the card (optional).
     * @param dailyLimitAmount - The daily spending limit amount for the card (optional).
     * @param statusNotProvided - Flag indicating if status was not provided in the request.
     * @param dailyLimitNotProvided - Flag indicating if daily limit was not provided in the request.
     * @returns Promise<any> - The core data of the updated card.
     * @throws NotFoundException if the user or card ID is not found.
     * @throws InternalServerErrorException if the update operation fails.
     * @throws BadRequestException if neither status nor daily limit is provided.
     */
    async updateCardDetails(
        userId: string,
        status: string,
        dailyLimitAmount: number,
        statusNotProvided: boolean = false,
        dailyLimitNotProvided: boolean = false
    ): Promise<any> {
        this.logger.log(`Updating card details for user ${userId} with status ${status || 'not provided'} and daily limit ${dailyLimitAmount || 'not provided'}`);

        if (statusNotProvided && dailyLimitNotProvided) {
            throw new BadRequestException('At least one of status or daily limit amount must be provided.');
        }

        // Fetch the user to get the cardId
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for card update.`);
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (!user.cardId) {
            this.logger.warn(`Card ID not found for user ${userId}.`);
            throw new NotFoundException(`Card ID not found for user ${userId}`);
        }

        const cardId = user.cardId;
        const zerocardBaseUrl = this.configService.get<string>('card.ZEROCARD_API_URL');
        const zerocardAuthToken = this.configService.get<string>('card.ZEROCARD_API_KEY');

        if (!zerocardBaseUrl || !zerocardAuthToken) {
            this.logger.error('ZeroCard API configuration is missing.');
            throw new InternalServerErrorException('ZeroCard API configuration is missing');
        }

        try {
            const cardData: any = {};
            if (!statusNotProvided) {
                cardData.status = status;
            }
            if (!dailyLimitNotProvided) {
                cardData.spendingControls = {
                    channels: {
                        mobile: true,
                        web: true,
                        pos: true,
                        atm: true,
                    },
                    blockedCategories: ['zerocard'],
                    allowedCategories: allowedCategories,
                    spendingLimits: [
                        {
                            interval: 'daily',
                            amount: dailyLimitAmount,
                        },
                    ],
                };
            }

            const updateResponse = await updateCard(
                zerocardBaseUrl,
                zerocardAuthToken,
                cardId,
                cardData,
            );

            this.logger.log(`Successfully updated card details for user ${userId}, card ID ${cardId}`);
            return updateResponse.data; // Return only the core data, following the pattern in orderCard.service.ts
        } catch (error) {
            this.logger.error(`Failed to update card for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new InternalServerErrorException(`Failed to update card: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
