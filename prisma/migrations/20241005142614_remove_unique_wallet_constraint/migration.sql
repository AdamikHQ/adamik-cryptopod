/*
  Warnings:

  - You are about to drop the column `walletId` on the `Account` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_walletId_fkey";

-- DropIndex
DROP INDEX "Wallet_id_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "walletId",
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_username_provider_fkey" FOREIGN KEY ("username", "provider") REFERENCES "Wallet"("userName", "provider") ON DELETE RESTRICT ON UPDATE CASCADE;
