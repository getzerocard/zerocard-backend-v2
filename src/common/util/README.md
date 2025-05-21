# Common Utilities

This directory contains common utility functions and modules used across the application.

## Utilities

### `eip7702.util.ts`

- **`sendPrivyErc20Transaction(params: SendGasAbstractedPrivyErc20TxParams): Promise<SendPrivyErc20TransactionResponse>`**
  - Handles sending gas-abstracted ERC-20 transactions using Privy for wallet/signer management and Biconomy for EIP-7702 Nexus smart account creation and MEE client execution.
  - It dynamically fetches token contract addresses and chain IDs using `getTokenBySymbol` from `fetchsupportedTokens.ts` based on provided symbols and network identifiers.
  - **`SendGasAbstractedPrivyErc20TxParams`**:
    - `privyClient: PrivyClient`: Instance of the Privy server-auth client.
    - `privyService: PrivyServiceLike`: A service that provides a `getWalletId(userId: string, chainType: string)` method to fetch user wallet details (ID and EOA address).
    - `userId: string`: The application-specific user ID.
    - `authorization: string`: Authorization signature/ID required by the Biconomy MEE client.
    - `recipientAddress: Address`: The address to send the ERC-20 tokens to.
    - `tokenAmount: bigint`: The amount of tokens to send (as a BigInt).
    - `networkType: 'MAINET' | 'TESTNET'`: Unified network type (MAINET or TESTNET) for both gas and transfer tokens.
    - `gasTokenSymbol: string`: Symbol of the token to be used for paying gas fees (e.g., "USDC").
    - `gasTokenBlockchainName: string`: Specific blockchain name for the gas token (e.g., "Base", "Optimism"), matching a `blockchainNetwork` in `fetchsupportedTokens.ts`.
    - `transferTokenSymbol: string`: Symbol of the ERC-20 token to be transferred.
    - `transferTokenBlockchainName: string`: Specific blockchain name for the transfer token.
    - `privyWalletChainType?: 'ethereum' | 'solana'`: Chain type for fetching the Privy wallet (defaults to `'ethereum'`).
    - `nexusRpcUrls?: { [chainId: number]: string }`: Optional map of chain IDs to specific RPC URLs for Biconomy Nexus account setup on Optimism and Base (e.g., `{ [optimism.id]: '...', [base.id]: '...' }`). If not provided, public RPCs are used.
  - **`SendPrivyErc20TransactionResponse`**:
    - `transactionHash: Hex`: The hash of the submitted transaction.
    - `message: string`: A success message.

### `fetchsupportedTokens.ts`
- **`getTokenBySymbol(symbol: string, network: string, chainType: string, blockchainNetwork?: string): Token | undefined`**
  - Fetches detailed information for a token based on its symbol, network type (MAINET/TESTNET), chain type (ethereum/solana), and specific blockchain network name.
  - Returns a `Token` object containing `name`, `symbol`, `decimals`, `tokenAddress`, `rpcUrl`, `chainId`, `gatewayAddress`, `network`, `chainType`, and `blockchainNetwork` or `undefined` if not found.

### Other Utilities

(Placeholder for descriptions of other utility files in this directory. Please document them as they are added or updated.)

- `debitCrypto.util.ts`
- `fetchTokenRate.ts`
- `getTokenBalance.ts`
- `money.ts`
- `rateConversion.util.ts`
- `userValidation.util.ts`
- `accountVerification.ts`
- `allowanceCheck.ts`
- `auth.util.ts`
- `dateFormat.util.ts`
- `email.util.ts`
- `encryption.utils.ts`
- `error.util.ts`
- `fetchSupportedCurrencies.ts`
- `address.validator.ts`
