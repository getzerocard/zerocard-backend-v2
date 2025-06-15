/*
  Warnings:

  - A unique constraint covering the columns `[symbol,chain]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tokens_symbol_idx";

-- DropIndex
DROP INDEX "tokens_symbol_key";

-- CreateIndex
CREATE UNIQUE INDEX "tokens_symbol_chain_key" ON "tokens"("symbol", "chain");
