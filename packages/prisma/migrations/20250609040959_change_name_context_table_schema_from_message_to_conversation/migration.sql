/*
  Warnings:

  - You are about to drop the `message_group_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_group_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "message_group_members" DROP CONSTRAINT "message_group_members_message_group_id_fkey";

-- DropForeignKey
ALTER TABLE "message_group_members" DROP CONSTRAINT "message_group_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "message_group_messages" DROP CONSTRAINT "message_group_messages_message_group_id_fkey";

-- DropForeignKey
ALTER TABLE "message_group_messages" DROP CONSTRAINT "message_group_messages_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_groups" DROP CONSTRAINT "message_groups_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropTable
DROP TABLE "message_group_members";

-- DropTable
DROP TABLE "message_group_messages";

-- DropTable
DROP TABLE "message_groups";

-- DropTable
DROP TABLE "messages";

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sender_id" TEXT NOT NULL,
    "is_deleted_by_sender" BOOLEAN NOT NULL DEFAULT false,
    "receiver_id" TEXT NOT NULL,
    "is_deleted_by_receiver" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_groups" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "avatar" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "conversation_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_group_members" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "conversation_group_id" TEXT NOT NULL,

    CONSTRAINT "conversation_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_group_messages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_by_owner" TIMESTAMP(3),
    "is_deleted_by_owner" BOOLEAN NOT NULL DEFAULT false,
    "conversation_group_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,

    CONSTRAINT "conversation_group_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_conversation_sender_id" ON "conversations"("sender_id");

-- CreateIndex
CREATE INDEX "idx_conversation_receiver_id" ON "conversations"("receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_groups_name_key" ON "conversation_groups"("name");

-- CreateIndex
CREATE INDEX "idx_conversation_group_owner_id" ON "conversation_groups"("owner_id");

-- CreateIndex
CREATE INDEX "idx_conversation_group_name" ON "conversation_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_groups_name_owner_id_key" ON "conversation_groups"("name", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_group_members_user_id_conversation_group_id_key" ON "conversation_group_members"("user_id", "conversation_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_group_messages_conversation_group_id_conversat_key" ON "conversation_group_messages"("conversation_group_id", "conversation_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_groups" ADD CONSTRAINT "conversation_groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_group_members" ADD CONSTRAINT "conversation_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_group_members" ADD CONSTRAINT "conversation_group_members_conversation_group_id_fkey" FOREIGN KEY ("conversation_group_id") REFERENCES "conversation_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_group_messages" ADD CONSTRAINT "conversation_group_messages_conversation_group_id_fkey" FOREIGN KEY ("conversation_group_id") REFERENCES "conversation_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_group_messages" ADD CONSTRAINT "conversation_group_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
