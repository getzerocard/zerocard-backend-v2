/*
  Warnings:

  - You are about to drop the column `device_type` on the `user_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_sessions" DROP COLUMN "device_type";
