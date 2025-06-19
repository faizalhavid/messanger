/*
  Warnings:

  - You are about to drop the `ConversationDelete` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConversationDelete" DROP CONSTRAINT "ConversationDelete_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationDelete" DROP CONSTRAINT "ConversationDelete_userId_fkey";

-- DropTable
DROP TABLE "ConversationDelete";
