/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `chat_room_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_room_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_rooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat_room_members" DROP CONSTRAINT "chat_room_members_chat_room_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_members" DROP CONSTRAINT "chat_room_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_messages" DROP CONSTRAINT "chat_room_messages_chat_room_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_messages" DROP CONSTRAINT "chat_room_messages_message_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_rooms" DROP CONSTRAINT "chat_rooms_owner_id_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted",
ADD COLUMN     "is_deleted_by_receiver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deleted_by_sender" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "chat_room_members";

-- DropTable
DROP TABLE "chat_room_messages";

-- DropTable
DROP TABLE "chat_rooms";

-- CreateTable
CREATE TABLE "message_groups" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "message_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_group_members" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "message_group_id" TEXT NOT NULL,

    CONSTRAINT "message_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_group_messages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "message_group_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,

    CONSTRAINT "message_group_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_message_group_owner_id" ON "message_groups"("owner_id");

-- CreateIndex
CREATE INDEX "idx_message_group_name" ON "message_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "message_groups_name_owner_id_key" ON "message_groups"("name", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_group_members_user_id_message_group_id_key" ON "message_group_members"("user_id", "message_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_group_messages_message_group_id_message_id_key" ON "message_group_messages"("message_group_id", "message_id");

-- AddForeignKey
ALTER TABLE "message_groups" ADD CONSTRAINT "message_groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_group_members" ADD CONSTRAINT "message_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_group_members" ADD CONSTRAINT "message_group_members_message_group_id_fkey" FOREIGN KEY ("message_group_id") REFERENCES "message_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_group_messages" ADD CONSTRAINT "message_group_messages_message_group_id_fkey" FOREIGN KEY ("message_group_id") REFERENCES "message_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_group_messages" ADD CONSTRAINT "message_group_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
