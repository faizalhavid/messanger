-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "conversationThreadId" TEXT;

-- CreateTable
CREATE TABLE "ConversationThread" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userAId" TEXT,
    "userBId" TEXT,
    "groupId" TEXT,

    CONSTRAINT "ConversationThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationThread_userAId_userBId_key" ON "ConversationThread"("userAId", "userBId");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_conversationThreadId_fkey" FOREIGN KEY ("conversationThreadId") REFERENCES "ConversationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "conversation_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
