/*
  Warnings:

  - You are about to drop the column `address` on the `user_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `zip_code` on the `user_addresses` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_addresses_country_state_city_zip_code_idx";

-- AlterTable
ALTER TABLE "user_addresses" DROP COLUMN "address",
DROP COLUMN "zip_code",
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "street" TEXT;

-- CreateIndex
CREATE INDEX "user_addresses_country_state_city_postal_code_idx" ON "user_addresses"("country", "state", "city", "postal_code");
