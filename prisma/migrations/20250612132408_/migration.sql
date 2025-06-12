/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `activity_logs` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('not_started', 'pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "activity_logs" DROP COLUMN "is_deleted",
ADD COLUMN     "deleted_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "user_profile" ALTER COLUMN "date_of_birth" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "kyc_status" "KycStatus" NOT NULL DEFAULT 'not_started',
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ;
