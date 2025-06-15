/*
  Warnings:

  - You are about to drop the column `currency_id` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the `currencies` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[api_key]` on the table `system_wallets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address]` on the table `system_wallets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wallet_id,chain]` on the table `system_wallets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `chain` on the `system_wallets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `address` to the `wallets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_wallet_id` to the `wallets` table without a default value. This is not possible if the table is not empty.
  - Made the column `owner_id` on table `wallets` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WalletChain" AS ENUM ('ethereum', 'bnb', 'polygon', 'tron', 'base', 'arbitrum', 'optimism', 'solana', 'celo', 'lisk');

-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_currency_id_fkey";

-- DropIndex
DROP INDEX "system_wallets_wallet_id_is_active_idx";

-- AlterTable
ALTER TABLE "system_wallets" DROP COLUMN "chain",
ADD COLUMN     "chain" "WalletChain" NOT NULL;

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "currency_id",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "chain" "WalletChain" NOT NULL DEFAULT 'ethereum',
ADD COLUMN     "provider_wallet_id" TEXT NOT NULL,
ALTER COLUMN "owner_id" SET NOT NULL;

-- DropTable
DROP TABLE "currencies";

-- DropEnum
DROP TYPE "SystemWalletChain";

-- CreateIndex
CREATE UNIQUE INDEX "system_wallets_api_key_key" ON "system_wallets"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "system_wallets_address_key" ON "system_wallets"("address");

-- CreateIndex
CREATE INDEX "system_wallets_wallet_id_is_active_chain_idx" ON "system_wallets"("wallet_id", "is_active", "chain");

-- CreateIndex
CREATE UNIQUE INDEX "system_wallets_wallet_id_chain_key" ON "system_wallets"("wallet_id", "chain");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- CreateIndex
CREATE INDEX "wallets_chain_idx" ON "wallets"("chain");

-- CreateIndex
CREATE INDEX "wallets_provider_wallet_id_idx" ON "wallets"("provider_wallet_id");
