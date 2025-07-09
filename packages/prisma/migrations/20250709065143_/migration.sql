-- DropForeignKey
ALTER TABLE "MarkObject" DROP CONSTRAINT "conversation_status_marks";

-- AddForeignKey
ALTER TABLE "MarkObject" ADD CONSTRAINT "conversation_marks" FOREIGN KEY ("markableObjectId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
