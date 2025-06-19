/*
  Warnings:

  - You are about to drop the column `identifier` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `wallets` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "wallets_identifier_idx";

-- DropIndex
DROP INDEX "wallets_identifier_key";

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "identifier",
DROP COLUMN "name";
