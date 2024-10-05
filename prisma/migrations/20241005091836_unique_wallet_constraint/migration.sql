/*
  Warnings:

  - You are about to drop the column `wallet_id` on the `Account` table. All the data in the column will be lost.
  - Added the required column `walletId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_wallet_id_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "wallet_id",
ADD COLUMN     "walletId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
