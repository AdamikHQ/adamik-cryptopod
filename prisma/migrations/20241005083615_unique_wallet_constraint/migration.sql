/*
  Warnings:

  - You are about to drop the column `address` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `chainId` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `remote_id` on the `Wallet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userName,provider]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Wallet_userName_chainId_key";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "address",
DROP COLUMN "chainId",
DROP COLUMN "remote_id",
ADD COLUMN     "id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "userName" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "address" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userName_chainId_key" ON "Account"("userName", "chainId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_id_key" ON "Wallet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userName_provider_key" ON "Wallet"("userName", "provider");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userName_fkey" FOREIGN KEY ("userName") REFERENCES "User"("userName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
