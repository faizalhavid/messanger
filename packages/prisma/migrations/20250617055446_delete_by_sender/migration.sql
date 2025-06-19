-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "deleted_at_by_sender" TIMESTAMP(3),
ADD COLUMN     "is_deleted_by_sender" BOOLEAN NOT NULL DEFAULT false;
