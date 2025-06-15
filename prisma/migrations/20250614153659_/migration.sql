/*
  Warnings:

  - You are about to drop the column `initiated_by_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `wallets` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_initiated_by_id_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "initiated_by_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "balance";

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "chain" "WalletChain" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_token_balances" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wallet_token_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_symbol_key" ON "tokens"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_chain_key" ON "tokens"("chain");

-- CreateIndex
CREATE INDEX "tokens_symbol_idx" ON "tokens"("symbol");

-- CreateIndex
CREATE INDEX "tokens_chain_idx" ON "tokens"("chain");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_token_balances_wallet_id_token_id_key" ON "wallet_token_balances"("wallet_id", "token_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_token_balances" ADD CONSTRAINT "wallet_token_balances_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_token_balances" ADD CONSTRAINT "wallet_token_balances_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
