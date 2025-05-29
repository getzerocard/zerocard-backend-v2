import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { getCard } from '../infrastructureHandlers/getCard.handler';

@Injectable()
export class GetCardService {
    private readonly logger = new Logger(GetCardService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Fetches the details of a user's card.
     * @param userId - The ID of the user whose card details are to be fetched.
     * @returns Promise<any> - The core data of the user's card.
     * @throws NotFoundException if the user or card ID is not found.
     * @throws InternalServerErrorException if fetching the card details fails.
     */
    async getCardDetails(userId: string): Promise<any> {
        this.logger.log(`Fetching card details for user ${userId}`);

        // Fetch the user to get the cardId
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for card retrieval.`);
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
            const cardResponse = await getCard(
                zerocardBaseUrl,
                zerocardAuthToken,
                cardId,
            );

            this.logger.log(`Successfully fetched card details for user ${userId}, card ID ${cardId}`);
            return cardResponse.data; // Return only the core data
        } catch (error) {
            this.logger.error(`Failed to fetch card for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new InternalServerErrorException(`Failed to fetch card: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
