/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Chat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Chat_userId_key" ON "Chat"("userId");
