/*
  Warnings:

  - Added the required column `asset` to the `transaction_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transaction_entries" ADD COLUMN     "asset" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
