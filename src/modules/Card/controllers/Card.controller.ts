import { HttpCode, HttpStatus, Post, Query, Get, Param, UseGuards, Logger, BadRequestException, Body, ValidationPipe, Patch } from '@nestjs/common';
import { OrderCardService } from '../services/orderCard.service';
import {
  OrderCardResponseDto,
  OrderCardSuccess,
  OrderCardErrors,
} from '../dto/order-card.dto';
import { PrivyUser } from '../../auth/decorators/privy-user.decorator';
import { PrivyUserData } from '../../auth/interfaces/privy-user.interface';
import { MapCardService } from '../services/mapCard.service';
import {
  MapCardServiceDataDto,
  ProviderCardDataDto,
  MapCardSuccess,
  MapCardErrors,
} from '../dto/mapCard.dto';
import { ApiController } from '../../../common/decorators/api-controller.decorator';
import {
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '../../../common/decorators/api-response.decorator';
import { Response } from '../../../common/interceptors/response.interceptor';
import { PrivyAuthGuard } from '../../../common/guards';
import { resolveAndAuthorizeUserId } from "../../../common/util/auth.util";
import { GetCardTokenInfoResponseDto, GetCardTokenInfoErrorResponses } from '../dto/get-card-token-info.dto';
import { Trim } from '../../../common/decorators/trim.decorator';
import { SendDefaultCardPinService } from '../services/sendDefaultCardPin.service';
import { SendDefaultPinDataDto, SendDefaultPinErrorResponses } from '../dto/send-default-pin.dto';
import { UpdateCardService } from '../services/updateCard.service';
import { UpdateCardRequestDto, UpdateCardResponseDto, UpdateCardErrorResponses } from '../dto/update-card.dto';
import { GetCardService } from '../services/getCard.service';
import { GetCardDetailsResponseDto, GetCardDetailsErrorResponses } from '../dto/get-card-details.dto';

/**
 * Controller to handle card ordering requests
 */
@ApiController('cards', 'Cards')
@ApiExtraModels(
  Response,
  OrderCardResponseDto,
  MapCardServiceDataDto,
  ProviderCardDataDto,
  GetCardTokenInfoResponseDto,
  SendDefaultPinDataDto,
  GetCardDetailsResponseDto
)
export class CardController {
  private readonly logger = new Logger(CardController.name);

  constructor(
    private readonly orderCardService: OrderCardService,
    private readonly mapCardService: MapCardService,
    private readonly sendDefaultCardPinService: SendDefaultCardPinService,
    private readonly updateCardService: UpdateCardService,
    private readonly getCardService: GetCardService,
  ) { }

  @Post(':userId/order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Order a new card for a user',
    description:
      "Initiates the card ordering process for the specified user. The user must have sufficient balance of the specified token to cover the card order fee. If the user is a sub-user, the main user must have pre-locked the necessary funds.",
  })
  @ApiParam({
    name: 'userId',
    description: "User ID (Privy DID) or 'me' for the currently authenticated user.",
    example: 'did:privy:user123',
    type: String,
  })
  @ApiQuery({
    name: 'symbol',
    type: String,
    description: 'Token symbol to be used for paying the order fee (e.g., USDC, ETH).',
    example: 'USDC',
    required: true,
  })
  @ApiQuery({
    name: 'chainType',
    enum: ['ethereum', 'solana'],
    description: "The blockchain type ('ethereum' or 'solana').",
    example: 'ethereum',
    required: true,
  })
  @ApiQuery({
    name: 'blockchainNetwork',
    type: String,
    description: 'The specific blockchain network (e.g., mainnet, sepolia, solana-mainnet).',
    example: 'sepolia',
    required: true,
  })
  @ApiStandardResponse(OrderCardResponseDto)
  @ApiResponse(OrderCardErrors.R400)
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden. User lacks permission to order card for the target user.' })
  @ApiResponse(OrderCardErrors.R500)
  async orderNewCard(
    @Param('userId') @Trim() userIdParam: string,
    @Query('symbol') @Trim() symbol: string,
    @Query('chainType') @Trim() chainType: 'ethereum' | 'solana',
    @Query('blockchainNetwork') @Trim() blockchainNetwork: string,
    @PrivyUser() authenticatedUser: PrivyUserData,
  ): Promise<OrderCardResponseDto> {
    this.logger.log(
      `Request to order card for user param: ${userIdParam} with symbol: ${symbol}, chain: ${chainType}, network: ${blockchainNetwork}`,
    );

    const targetUserId = resolveAndAuthorizeUserId(
      userIdParam,
      authenticatedUser.userId,
      'You are not authorized to order a card for this user.',
    );

    this.logger.log(
      `Authorized. Ordering card for resolved user ID: ${targetUserId}`,
    );

    if (chainType !== 'ethereum' && chainType !== 'solana') {
      throw new BadRequestException("Invalid chainType. Must be 'ethereum' or 'solana'.");
    }

    return await this.orderCardService.orderCard(
      targetUserId,
      symbol, // Service handles normalization
      chainType,
      blockchainNetwork,
    );
  }

  @Post('map')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Map a card to a user',
    description:
      'Maps a card to the specified user. All parameters must be provided as query parameters.',
  })
  @ApiStandardResponse(MapCardServiceDataDto, 'Card mapped successfully')
  @ApiResponse(MapCardErrors.R400)
  @ApiResponse(MapCardErrors.R403)
  @ApiResponse(MapCardErrors.R404)
  @ApiResponse(MapCardErrors.R409)
  @ApiResponse(MapCardErrors.R500)
  @ApiQuery({
    name: 'userId',
    type: String,
    description: "User ID (Privy DID) or 'me' for the currently authenticated user.",
    example: 'me',
    required: true,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    description: 'Status of the card mapping',
    example: 'active',
    required: true,
  })
  @ApiQuery({
    name: 'expirationDate',
    type: String,
    description: 'Expiration date of the card',
    example: '2025-12-31',
    required: true,
  })
  @ApiQuery({
    name: 'number',
    type: String,
    description: 'Card number',
    example: '1234567890123456',
    required: true,
  })
  async mapCard(
    @PrivyUser() authenticatedUser: PrivyUserData,
    @Query('userId') @Trim() userIdQuery: string,
    @Query('status') @Trim() status: string,
    @Query('expirationDate') @Trim() expirationDate: string,
    @Query('number') @Trim() number: string,
  ): Promise<MapCardServiceDataDto> {
    const targetUserId = resolveAndAuthorizeUserId(
      userIdQuery,
      authenticatedUser.userId,
      'You are not authorized to map a card for this user.',
    );

    this.logger.log(`Authorized. Mapping card for resolved user ID: ${targetUserId}`);

    return await this.mapCardService.mapCard(
      targetUserId,
      status,
      expirationDate,
      number,
    );
  }

  @Get(':userId/token-info')
  @ApiOperation({
    summary: "Get secure token information for a user's card",
    description: "Retrieves a short-lived secure token associated with the user's mapped card. This token can be used for displaying sensitive card details securely on the client-side.",
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (Privy DID) or \'me\' for the currently authenticated user.',
    example: 'did:privy:user123',
    type: String,
  })
  @ApiStandardResponse(GetCardTokenInfoResponseDto)
  @ApiResponse(GetCardTokenInfoErrorResponses.R400)
  @ApiResponse(GetCardTokenInfoErrorResponses.R401)
  @ApiResponse(GetCardTokenInfoErrorResponses.R403)
  @ApiResponse(GetCardTokenInfoErrorResponses.R404)
  @ApiResponse(GetCardTokenInfoErrorResponses.R500)
  async getCardTokenInformation(
    @Param('userId') @Trim() userIdParam: string,
    @PrivyUser() authenticatedUser: PrivyUserData,
  ): Promise<GetCardTokenInfoResponseDto> {
    this.logger.log(
      `Request to get card token information for user param: ${userIdParam}`,
    );

    const targetUserId = resolveAndAuthorizeUserId(
      userIdParam,
      authenticatedUser.userId,
      'Cannot fetch card token information for another user.',
    );

    this.logger.log(
      `Authorized. Fetching card token for resolved user ID: ${targetUserId}`,
    );

    const cardInfo = await this.mapCardService.getCardInfo(targetUserId);

    return cardInfo;
  }

  @Post(':userId/send-default-pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send default PIN for a user\'s card',
    description: "Triggers the process to send the default PIN for the user's mapped card. The PIN is typically sent via SMS to the user's registered contact information with the card provider.",
  })
  @ApiParam({
    name: 'userId',
    description: "User ID (Privy DID) or 'me' for the currently authenticated user.",
    example: 'did:privy:user123',
    type: String,
  })
  @ApiStandardResponse(SendDefaultPinDataDto)
  @ApiResponse(SendDefaultPinErrorResponses.responses[0]) // 400
  @ApiResponse(SendDefaultPinErrorResponses.responses[1]) // 404
  @ApiResponse(SendDefaultPinErrorResponses.responses[2]) // 500
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized. Invalid or missing token.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden. User lacks permission to perform this action for the target user.' })
  async sendDefaultPin(
    @Param('userId') @Trim() userIdParam: string,
    @PrivyUser() authenticatedUser: PrivyUserData,
  ): Promise<SendDefaultPinDataDto> {
    this.logger.log(
      `Request to send default PIN for user param: ${userIdParam}`,
    );

    const targetUserId = resolveAndAuthorizeUserId(
      userIdParam,
      authenticatedUser.userId,
      'You are not authorized to send a default PIN for this user\'s card.',
    );

    this.logger.log(
      `Authorized. Sending default PIN for resolved user ID: ${targetUserId}`,
    );

    return await this.sendDefaultCardPinService.sendDefaultPinByUserId(targetUserId);
  }

  /**
   * Update card details for a user.
   * @param userIdParam - User ID (Privy DID) or 'me' for the currently authenticated user.
   * @param userData - The authenticated user's data.
   * @param status - The new status of the card (optional).
   * @param dailyLimitAmount - The daily spending limit amount for the card (optional).
   * @returns Object containing the updated card details.
   */
  @Patch('update/:userId')
  @ApiOperation({
    summary: 'Update card details for a user',
    description: 'Update the status and/or spending limits of a user\'s card. At least one of status or daily limit must be provided.',
  })
  @ApiStandardResponse(UpdateCardResponseDto, 'Card updated successfully')
  @ApiResponse(UpdateCardErrorResponses.R400_BAD_REQUEST)
  @ApiResponse(UpdateCardErrorResponses.R401_UNAUTHORIZED)
  @ApiResponse(UpdateCardErrorResponses.R404_NOT_FOUND)
  @ApiResponse(UpdateCardErrorResponses.R500_INTERNAL_SERVER_ERROR)
  @ApiParam({
    name: 'userId',
    description: "User ID (Privy DID) or 'me' for the currently authenticated user.",
    example: 'did:privy:user123',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    description: 'The new status of the card',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @ApiQuery({
    name: 'dailyLimitAmount',
    description: 'The daily spending limit amount for the card',
    example: '1000',
    type: String,
    required: false,
  })
  async updateCard(
    @Param('userId') @Trim() userIdParam: string,
    @PrivyUser() userData: PrivyUserData,
    @Query('status') status?: 'active' | 'inactive',
    @Query('dailyLimitAmount') dailyLimitAmount?: string,
  ): Promise<UpdateCardResponseDto> {
    const targetUserId = resolveAndAuthorizeUserId(
      userIdParam,
      userData.userId,
      'You are not authorized to update the card for this user.',
    );

    if (!status && !dailyLimitAmount) {
      throw new BadRequestException('At least one of status or daily limit amount must be provided.');
    }

    let dailyLimitAmountNumber: number | undefined;
    if (dailyLimitAmount) {
      dailyLimitAmountNumber = parseFloat(dailyLimitAmount);
      if (isNaN(dailyLimitAmountNumber)) {
        throw new BadRequestException('Invalid daily limit amount. Must be a number.');
      }
    }

    this.logger.log(`Updating card for user ${targetUserId} with status: ${status || 'not provided'} and daily limit: ${dailyLimitAmount || 'not provided'}`);
    const result = await this.updateCardService.updateCardDetails(
      targetUserId,
      status || '',
      dailyLimitAmountNumber || 0,
      status === undefined,
      dailyLimitAmountNumber === undefined
    );
    return result;
  }

  @Get(':userId/details')
  @ApiOperation({
    summary: "Get details of a user's card",
    description: "Retrieves the detailed information of the card associated with the specified user.",
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (Privy DID) or \'me\' for the currently authenticated user.',
    example: 'did:privy:user123',
    type: String,
  })
  @ApiStandardResponse(GetCardDetailsResponseDto)
  @ApiResponse(GetCardDetailsErrorResponses.responses[0])
  @ApiResponse(GetCardDetailsErrorResponses.responses[1])
  @ApiResponse(GetCardDetailsErrorResponses.responses[2])
  @ApiResponse(GetCardDetailsErrorResponses.responses[3])
  @ApiResponse(GetCardDetailsErrorResponses.responses[4])
  async getCardDetails(
    @Param('userId') @Trim() userIdParam: string,
    @PrivyUser() authenticatedUser: PrivyUserData,
  ): Promise<any> {
    this.logger.log(`Request to get card details for user param: ${userIdParam}`);

    const targetUserId = resolveAndAuthorizeUserId(
      userIdParam,
      authenticatedUser.userId,
      'Cannot fetch card details for another user.',
    );

    this.logger.log(`Authorized. Fetching card details for resolved user ID: ${targetUserId}`);

    const cardDetails = await this.getCardService.getCardDetails(targetUserId);

    return cardDetails;
  }
}

