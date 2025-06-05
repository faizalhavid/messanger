/*
  Warnings:

  - You are about to drop the column `birthDate` on the `biodata` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `biodata` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `biodata` table. All the data in the column will be lost.
  - You are about to drop the column `chatRoomId` on the `chat_room_members` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `chat_room_members` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `chat_room_members` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `chat_room_members` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `chat_room_members` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `chat_room_members` table. All the data in the column will be lost.
  - You are about to drop the column `chatRoomId` on the `chat_room_messages` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `chat_room_messages` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `chat_room_messages` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `chat_room_messages` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `chat_room_messages` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `chat_room_messages` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `chat_rooms` table. All the data in the column will be lost.
  - You are about to drop the column `isGroup` on the `chat_rooms` table. All the data in the column will be lost.
  - You are about to drop the column `owenerId` on the `chat_rooms` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `chat_rooms` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `bioId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,chat_room_id]` on the table `chat_room_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chat_room_id,message_id]` on the table `chat_room_messages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,owner_id]` on the table `chat_rooms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bio_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birth_date` to the `biodata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `biodata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_room_id` to the `chat_room_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `chat_room_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `chat_room_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_room_id` to the `chat_room_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_id` to the `chat_room_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `chat_room_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `chat_rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `chat_rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chat_room_members" DROP CONSTRAINT "chat_room_members_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_members" DROP CONSTRAINT "chat_room_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_messages" DROP CONSTRAINT "chat_room_messages_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_messages" DROP CONSTRAINT "chat_room_messages_messageId_fkey";

-- DropForeignKey
ALTER TABLE "chat_rooms" DROP CONSTRAINT "chat_rooms_owenerId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_bioId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropIndex
DROP INDEX "chat_room_members_userId_chatRoomId_key";

-- DropIndex
DROP INDEX "chat_room_messages_chatRoomId_messageId_key";

-- DropIndex
DROP INDEX "chat_rooms_name_owenerId_key";

-- DropIndex
DROP INDEX "idx_chatroom_owner_id";

-- DropIndex
DROP INDEX "idx_message_receiver_id";

-- DropIndex
DROP INDEX "idx_message_sender_id";

-- DropIndex
DROP INDEX "idx_profile_bio_id";

-- DropIndex
DROP INDEX "idx_profile_user_id";

-- DropIndex
DROP INDEX "profiles_bioId_key";

-- DropIndex
DROP INDEX "profiles_userId_key";

-- AlterTable
ALTER TABLE "biodata" DROP COLUMN "birthDate",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "birth_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "chat_room_members" DROP COLUMN "chatRoomId",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "chat_room_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "chat_room_messages" DROP COLUMN "chatRoomId",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
DROP COLUMN "messageId",
DROP COLUMN "updatedAt",
ADD COLUMN     "chat_room_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "chat_rooms" DROP COLUMN "createdAt",
DROP COLUMN "isGroup",
DROP COLUMN "owenerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_group" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "owner_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiver_id" TEXT NOT NULL,
ADD COLUMN     "sender_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "bioId",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "userId",
ADD COLUMN     "bio_id" TEXT,
ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_members_user_id_chat_room_id_key" ON "chat_room_members"("user_id", "chat_room_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_messages_chat_room_id_message_id_key" ON "chat_room_messages"("chat_room_id", "message_id");

-- CreateIndex
CREATE INDEX "idx_chatroom_owner_id" ON "chat_rooms"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_name_owner_id_key" ON "chat_rooms"("name", "owner_id");

-- CreateIndex
CREATE INDEX "idx_message_sender_id" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "idx_message_receiver_id" ON "messages"("receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_bio_id_key" ON "profiles"("bio_id");

-- CreateIndex
CREATE INDEX "idx_profile_user_id" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_profile_bio_id" ON "profiles"("bio_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_bio_id_fkey" FOREIGN KEY ("bio_id") REFERENCES "biodata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_messages" ADD CONSTRAINT "chat_room_messages_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_messages" ADD CONSTRAINT "chat_room_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
