-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_edited" BOOLEAN NOT NULL DEFAULT false;
