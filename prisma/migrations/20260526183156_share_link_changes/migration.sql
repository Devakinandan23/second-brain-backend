/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ShareLink` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ShareLink" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_userId_key" ON "ShareLink"("userId");
