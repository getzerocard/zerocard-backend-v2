/*
  Warnings:

  - You are about to drop the column `bin` on the `user_cards` table. All the data in the column will be lost.
  - You are about to drop the column `last4` on the `user_cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_cards" DROP COLUMN "bin",
DROP COLUMN "last4";
