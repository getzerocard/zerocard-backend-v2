import { SYSTEM_CONFIG_KEYS } from '../../src/shared/types/system-config.type';
import { PrismaClient } from '@prisma/client';

type SystemConfigInput = {
  key: string;
  value: string;
};

const getSystemConfigs = (): SystemConfigInput[] => {
  return [
    {
      key: SYSTEM_CONFIG_KEYS.CARD_ORDER_AMOUNT,
      value: '7',
    },
  ];
};

export const seedSystemConfigs = async (prisma: PrismaClient) => {
  console.log('Seeding system configs...');

  try {
    const configs = getSystemConfigs();

    await prisma.$transaction(
      async tx => {
        await tx.systemConfig.createMany({
          data: configs,
          skipDuplicates: true,
        });
      },
      {
        timeout: 30000,
        maxWait: 35000,
      },
    );

    console.log('System config seeding completed');
  } catch (error) {
    console.error('Error seeding system configs:', error);
    throw error;
  }
};
