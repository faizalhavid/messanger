-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "isDeletedBySender" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ConversationDelete" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationDelete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationDelete_userId_idx" ON "ConversationDelete"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationDelete_conversationId_userId_key" ON "ConversationDelete"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "ConversationDelete" ADD CONSTRAINT "ConversationDelete_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationDelete" ADD CONSTRAINT "ConversationDelete_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
