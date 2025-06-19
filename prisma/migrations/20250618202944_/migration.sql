/*
  Warnings:

  - You are about to drop the column `balance` on the `wallet_token_balances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wallet_token_balances" DROP COLUMN "balance",
ADD COLUMN     "available_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "ledger_balance" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_key_idx" ON "system_configs"("key");
