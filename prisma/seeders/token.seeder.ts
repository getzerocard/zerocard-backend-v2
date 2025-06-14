import { PrismaClient, WalletChain } from '@prisma/client';

type SeedTokenInput = {
  name: string;
  symbol: string;
  decimals: number;
  chain: WalletChain;
};

const getSeedTokens = (): SeedTokenInput[] => {
  return [
    {
      name: 'Tether USD (Ethereum)',
      symbol: 'usdt',
      decimals: 6,
      chain: WalletChain.ethereum,
    },
    {
      name: 'USD Coin (Ethereum)',
      symbol: 'usdc',
      decimals: 6,
      chain: WalletChain.ethereum,
    },
    {
      name: 'USD Coin (Solana)',
      symbol: 'usdc',
      decimals: 6,
      chain: WalletChain.solana,
    },
    {
      name: 'Tether USD (Solana)',
      symbol: 'usdt',
      decimals: 6,
      chain: WalletChain.solana,
    },
  ];
};

export const seedTokens = async (prisma: PrismaClient) => {
  console.log('Seeding tokens...');

  try {
    const tokens = getSeedTokens();

    await prisma.$transaction(
      async tx => {
        for (const token of tokens) {
          await tx.token.upsert({
            where: {
              chain: token.chain,
            },
            update: {
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
            },
            create: token,
          });
        }
      },
      {
        timeout: 30000,
        maxWait: 35000,
      },
    );

    console.log('Token seeding completed');
  } catch (error) {
    console.error('Error seeding tokens:', error);
    throw error;
  }
};
