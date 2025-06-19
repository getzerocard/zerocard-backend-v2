-- CreateEnum
CREATE TYPE "CardBrand" AS ENUM ('verve', 'mastercard', 'visa');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('physical', 'virtual');

-- CreateTable
CREATE TABLE "sudo_customers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sudo_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_cards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sudo_card_id" TEXT NOT NULL,
    "bin" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expiry_month" TEXT NOT NULL,
    "expiry_year" TEXT NOT NULL,
    "brand" "CardBrand" NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'active',
    "type" "CardType" NOT NULL DEFAULT 'physical',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kyc" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sudo_customers_user_id_key" ON "sudo_customers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sudo_customers_customer_id_key" ON "sudo_customers"("customer_id");

-- CreateIndex
CREATE INDEX "sudo_customers_user_id_idx" ON "sudo_customers"("user_id");

-- CreateIndex
CREATE INDEX "user_cards_user_id_idx" ON "user_cards"("user_id");

-- CreateIndex
CREATE INDEX "user_cards_sudo_card_id_idx" ON "user_cards"("sudo_card_id");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_userId_key" ON "Kyc"("userId");

-- AddForeignKey
ALTER TABLE "sudo_customers" ADD CONSTRAINT "sudo_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
