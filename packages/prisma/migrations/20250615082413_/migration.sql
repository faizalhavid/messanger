/*
  Warnings:

  - You are about to drop the column `is_deleted_by_user_a` on the `ConversationThread` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted_by_user_b` on the `ConversationThread` table. All the data in the column will be lost.
  - You are about to drop the column `userAId` on the `ConversationThread` table. All the data in the column will be lost.
  - You are about to drop the column `userBId` on the `ConversationThread` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type,interlocutor_id,groupId]` on the table `ConversationThread` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ConversationThread" DROP CONSTRAINT "ConversationThread_userAId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationThread" DROP CONSTRAINT "ConversationThread_userBId_fkey";

-- DropIndex
DROP INDEX "ConversationThread_userAId_userBId_key";

-- AlterTable
ALTER TABLE "ConversationThread" DROP COLUMN "is_deleted_by_user_a",
DROP COLUMN "is_deleted_by_user_b",
DROP COLUMN "userAId",
DROP COLUMN "userBId",
ADD COLUMN     "interlocutor_id" TEXT,
ADD COLUMN     "is_deleted_by_interlocutor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deleted_by_user" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alias" VARCHAR(100),
    "contact_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_contact_user_id" ON "Contact"("owner_id");

-- CreateIndex
CREATE INDEX "idx_contact_friend_id" ON "Contact"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_owner_id_contact_id_key" ON "Contact"("owner_id", "contact_id");

-- CreateIndex
CREATE INDEX "idx_conversation_thread_interlocutor_id" ON "ConversationThread"("interlocutor_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationThread_type_interlocutor_id_groupId_key" ON "ConversationThread"("type", "interlocutor_id", "groupId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_interlocutor_id_fkey" FOREIGN KEY ("interlocutor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
