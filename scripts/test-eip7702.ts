// import { executeGasAbstractedTransaction } from '../src/common/util/eip7702.util';
// import { Logger } from '@nestjs/common';
// import { type Address } from 'viem';

// const logger = new Logger('TestEip7702');

// async function testDynamicImports() {
//     logger.log('Starting test for dynamic imports in eip7702.util.ts');

//     // Create a mock instance of the dependencies
//     const mockPrivyService = {
//         privyClient: {},
//         getWalletId: async (): Promise<{ id: string; address: Address }> => ({
//             id: 'mock-wallet-id',
//             address: '0x0000000000000000000000000000000000000000' as Address,
//         }),
//     };

//     try {
//         // We're not going to execute the full function but just verify that the dynamic imports resolve
//         // We're using a non-existent token to deliberately fail early (after the imports, but before the actual execution)
//         const params = {
//             privyService: mockPrivyService,
//             authorization: 'mock-auth',
//             networkType: 'TESTNET' as const,
//             chainType: 'ETH',
//             gasTokenSymbol: 'NON_EXISTENT_TOKEN', // This will cause a controlled failure
//             gasTokenBlockchainName: 'Ethereum',
//             abi: [] as any,
//             functionName: 'test',
//             args: [],
//         };

//         logger.log('Calling executeGasAbstractedTransaction with invalid token to test imports...');

//         try {
//             await executeGasAbstractedTransaction(params);
//             // We should not reach here since the function should throw
//             logger.error('❌ Function should have failed due to invalid token');
//         } catch (err: any) {
//             if (err.message && err.message.includes('NON_EXISTENT_TOKEN') && err.message.includes('not found')) {
//                 logger.log('✅ Dynamic imports worked! Function failed as expected with error:', err.message);
//             } else if (err.message && (
//                 err.message.includes('Cannot find module') ||
//                 err.message.includes('not exported') ||
//                 err.message.includes('undefined')
//             )) {
//                 logger.error('❌ Import failed:', err.message);
//                 throw err;
//             } else {
//                 logger.log('⚠️ Function failed with unexpected error:', err.message);
//                 logger.log('This may still indicate that imports worked if the error is related to execution rather than imports');
//             }
//         }

//         logger.log('Test completed');
//     } catch (error) {
//         logger.error('Test failed with a critical error:', error);
//         process.exit(1);
//     }
// }

// // Run the test
// testDynamicImports().catch(err => {
//     logger.error('Unhandled error in test:', err);
//     process.exit(1);
// });
