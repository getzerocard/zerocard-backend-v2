/*
  Warnings:

  - You are about to drop the `user_auth` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,provider]` on the table `oauth_connections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SystemWalletChain" AS ENUM ('ethereum', 'bnb', 'polygon', 'tron', 'base', 'arbitrum', 'optimism', 'solana', 'celo', 'lisk');

-- DropForeignKey
ALTER TABLE "oauth_connections" DROP CONSTRAINT "oauth_connections_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_auth" DROP CONSTRAINT "user_auth_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_user_id_fkey";

-- DropIndex
DROP INDEX "activity_logs_created_at_idx";

-- DropIndex
DROP INDEX "activity_logs_user_id_idx";

-- DropIndex
DROP INDEX "user_sessions_user_id_isActive_idx";

-- DropIndex
DROP INDEX "users_email_idx";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "additional_info" JSONB,
ADD COLUMN     "date_of_birth" TIMESTAMPTZ,
ADD COLUMN     "dialing_code" TEXT,
ADD COLUMN     "email_verified_at" TIMESTAMPTZ,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phone_number" TEXT;

-- DropTable
DROP TABLE "user_auth";

-- DropTable
DROP TABLE "user_profile";

-- CreateTable
CREATE TABLE "system_wallets" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" "SystemWalletChain" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "system_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "country" TEXT,
    "zip_code" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_wallets_wallet_id_is_active_idx" ON "system_wallets"("wallet_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "system_wallets_wallet_id_key" ON "system_wallets"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_addresses_user_id_key" ON "user_addresses"("user_id");

-- CreateIndex
CREATE INDEX "user_addresses_user_id_idx" ON "user_addresses"("user_id");

-- CreateIndex
CREATE INDEX "user_addresses_country_state_city_zip_code_idx" ON "user_addresses"("country", "state", "city", "zip_code");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "oauth_connections_user_id_provider_idx" ON "oauth_connections"("user_id", "provider");

-- CreateIndex
CREATE INDEX "oauth_connections_provider_user_id_idx" ON "oauth_connections"("provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_connections_user_id_provider_key" ON "oauth_connections"("user_id", "provider");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_isActive_device_fingerprint_idx" ON "user_sessions"("user_id", "isActive", "device_fingerprint");

-- CreateIndex
CREATE INDEX "users_email_unique_name_phone_number_date_of_birth_gender_d_idx" ON "users"("email", "unique_name", "phone_number", "date_of_birth", "gender", "dialing_code", "kyc_status", "wallets_generated_at");

-- AddForeignKey
ALTER TABLE "oauth_connections" ADD CONSTRAINT "oauth_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
