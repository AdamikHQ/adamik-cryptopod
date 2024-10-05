/*
  Warnings:

  - Added the required column `chainId` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "chainId" TEXT NOT NULL;
