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
      chain: 'ethereum',
    },
    {
      name: 'USD Coin (Ethereum)',
      symbol: 'usdc',
      decimals: 6,
      chain: 'ethereum',
    },
    {
      name: 'USD Coin (Solana)',
      symbol: 'usdc',
      decimals: 6,
      chain: 'solana',
    },
    {
      name: 'Tether USD (Solana)',
      symbol: 'usdt',
      decimals: 6,
      chain: 'solana',
    },
  ];
};

export const seedTokens = async (prisma: PrismaClient) => {
  console.log('Seeding tokens...');

  try {
    const tokens = getSeedTokens();

    await prisma.$transaction(
      async tx => {
        for (const tk of tokens) {
          await tx.token.upsert({
            where: {
              symbol_chain: {
                chain: tk.chain,
                symbol: tk.symbol,
              },
            },
            create: tk,
            update: {
              name: tk.name,
              symbol: tk.symbol,
              decimals: tk.decimals,
            },
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
