-- AlterTable
ALTER TABLE "message_groups" ADD COLUMN     "avatar" VARCHAR(255),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;
