/*
  Warnings:

  - Made the column `state` on table `user_addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `user_addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `street` on table `user_addresses` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CardOrderStatus" AS ENUM ('processing', 'completed', 'failed');

-- AlterTable
ALTER TABLE "user_addresses" ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "street" SET NOT NULL;

-- CreateTable
CREATE TABLE "card_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "CardOrderStatus" NOT NULL DEFAULT 'processing',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "fulfilled_at" TIMESTAMPTZ,

    CONSTRAINT "card_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_orders_user_id_idx" ON "card_orders"("user_id");

-- AddForeignKey
ALTER TABLE "card_orders" ADD CONSTRAINT "card_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
