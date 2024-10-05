/*
  Warnings:

  - Added the required column `remote_id` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "remote_id" TEXT NOT NULL;
