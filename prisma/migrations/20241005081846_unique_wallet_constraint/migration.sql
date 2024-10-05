/*
  Warnings:

  - A unique constraint covering the columns `[userId,chainId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Wallet_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_chainId_key" ON "Wallet"("userId", "chainId");
