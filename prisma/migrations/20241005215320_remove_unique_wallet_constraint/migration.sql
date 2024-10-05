/*
  Warnings:

  - You are about to drop the column `username` on the `Account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_username_provider_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "username";

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userName_provider_fkey" FOREIGN KEY ("userName", "provider") REFERENCES "Wallet"("userName", "provider") ON DELETE RESTRICT ON UPDATE CASCADE;
