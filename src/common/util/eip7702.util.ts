import { http, encodeFunctionData, type Address, type Hex, type Abi } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { Logger } from '@nestjs/common';
import { getTokenBySymbol, type Token as FetchedTokenDetail } from './fetchsupportedTokens';
import { createViemAccount } from '@privy-io/server-auth/viem';

const logger = new Logger('Eip7702Util');



// Interface for the PrivyService to define the expected getWalletId method
interface PrivyServiceLike {
    privyClient: any; // Replace with actual PrivyClient type
    getWalletId(chainType: string): Promise<{ id: string; address: Address }>;
}

export interface ExecuteGasAbstractedTxParams {
    privyService: PrivyServiceLike;
    authorization: string;
    networkType: 'MAINET' | 'TESTNET';
    chainType: string;

    // Token specifications
    gasTokenSymbol: string;
    gasTokenBlockchainName: string;
    transferTokenSymbol?: string;
    transferTokenBlockchainName?: string;

    // Transaction parameters
    abi: Abi;
    functionName: string;
    /**
     * Function arguments - should match the ABI's expected types.
     * Typically includes Address (string), bigint, or other primitive types.
     */
    args: unknown[];

    nexusRpcUrls?: { [chainId: number]: string };
}

export interface GasAbstractedTxResponse {
    transactionHash: Hex;
    message: string;
}

/**
 * Reusable function to send a gas-abstracted transaction using Privy and Biconomy.
 * Supports any ABI and function call.
 */
export async function executeGasAbstractedTransaction({
    privyService,
    authorization,
    networkType,
    chainType,
    gasTokenSymbol,
    gasTokenBlockchainName,
    transferTokenSymbol,
    transferTokenBlockchainName,
    abi,
    functionName,
    args,
    nexusRpcUrls,
}: ExecuteGasAbstractedTxParams): Promise<GasAbstractedTxResponse> {
    try {
        // Get wallet details
        const { id: walletId, address } = await privyService.getWalletId(chainType);

        // Get gas token details
        const gasTokenDetails = getTokenBySymbol(
            gasTokenSymbol,
            networkType,
            chainType,
            gasTokenBlockchainName
        );
        if (!gasTokenDetails) {
            throw new Error(`Gas token ${gasTokenSymbol} not found`);
        }

        // Get transfer token details if specified
        let transferTokenDetails: FetchedTokenDetail | undefined;
        if (transferTokenSymbol && transferTokenBlockchainName) {
            transferTokenDetails = getTokenBySymbol(
                transferTokenSymbol,
                networkType,
                chainType,
                transferTokenBlockchainName
            );
            if (!transferTokenDetails) {
                throw new Error(`Transfer token ${transferTokenSymbol} not found`);
            }
        }

        // Create Viem account
        const serverWalletAccount = await createViemAccount({
            walletId,
            address,
            privy: privyService.privyClient,
        });

        // Instead of importing these functions, we'll use a runtime approach
        // that bypasses TypeScript's static checking
        // At runtime, we'll dynamically load and use these functions
        const biconomyModule = await Function('return import("@biconomy/abstractjs")')();

        // Create Nexus account using the dynamically loaded function
        const nexusAccount = await biconomyModule.toMultiChainNexusAccount({
            chains: [base,baseSepolia],
            transports: [http('https://mainnet.base.org'),http('https://sepolia.base.org')],
            signer: serverWalletAccount,
            accountAddress: address,
        });
        console.log("EIP-7702 Smart Account created at:", nexusAccount.address)

        // Create MEE client using the dynamically loaded function
        const meeClient = await biconomyModule.createMeeClient({ account: nexusAccount });

        // Prepare transaction data
        const callData = transferTokenDetails
            ? encodeFunctionData({
                abi,
                functionName,
                args: args as any,
            })
            : undefined;

        const mcSymbol = `mc${gasTokenDetails.symbol.toUpperCase()}`;
        const mcGasToken = biconomyModule[mcSymbol];
        if (!mcGasToken) {
            throw new Error(`Biconomy doesn't support ${mcSymbol}`);
        }
        console.log("MEE Client created", meeClient)

        // Execute transaction
        const result = await meeClient.execute({
            authorization,
            feeToken: {
                address: mcGasToken.addressOn(transferTokenDetails.chainId),
                chainId: transferTokenDetails.chainId,
            },
            instructions: transferTokenDetails ? [{
                chainId: transferTokenDetails.chainId,
                calls: [{
                    to: transferTokenDetails.tokenAddress as Address,
                    data: callData,
                    value: 0n,
                }],
            }] : [],
        });

        return {
            transactionHash: result.hash,
            message: 'Transaction submitted successfully',
        };
    } catch (error) {
        logger.error('Error in executeGasAbstractedTransaction:', error);
        throw error;
    }
}
