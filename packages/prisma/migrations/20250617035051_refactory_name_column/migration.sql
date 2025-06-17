/*
  Warnings:

  - You are about to drop the column `is_edited` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `ConversationStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConversationStatus" DROP CONSTRAINT "ConversationStatus_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationStatus" DROP CONSTRAINT "ConversationStatus_userId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "is_edited",
DROP COLUMN "updated_at";

-- DropTable
DROP TABLE "ConversationStatus";

-- CreateTable
CREATE TABLE "conversation_status" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "conversation_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_status_userId_idx" ON "conversation_status"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_status_conversationId_userId_key" ON "conversation_status"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "conversation_status" ADD CONSTRAINT "conversation_status_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_status" ADD CONSTRAINT "conversation_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
