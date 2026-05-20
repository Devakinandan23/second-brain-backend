-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('document', 'tweet', 'youtube', 'link');

-- CreateTable
CREATE TABLE "Note" (
    "id" UUID NOT NULL,
    "type" "NoteType" NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "tags" TEXT[],
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Note_type_idx" ON "Note"("type");

