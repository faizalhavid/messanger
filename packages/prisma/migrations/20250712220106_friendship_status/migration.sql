/*
  Warnings:

  - You are about to drop the column `status` on the `Friendship` table. All the data in the column will be lost.
  - Changed the type of `markableType` on the `MarkObject` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Thread` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MarkableTypeEnum" AS ENUM ('CONVERSATION', 'THREAD', 'FRIENDSHIP');

-- CreateEnum
CREATE TYPE "ThreadTypeEnum" AS ENUM ('PRIVATE', 'GROUP');

-- CreateEnum
CREATE TYPE "FriendshipStatusEnum" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED', 'DECLINED');

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "status",
ADD COLUMN     "currentStatus" "FriendshipStatusEnum" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "MarkObject" DROP COLUMN "markableType",
ADD COLUMN     "markableType" "MarkableTypeEnum" NOT NULL;

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "type",
ADD COLUMN     "type" "ThreadTypeEnum" NOT NULL;

-- DropEnum
DROP TYPE "FriendshipStatus";

-- DropEnum
DROP TYPE "MarkableType";

-- DropEnum
DROP TYPE "ThreadType";

-- CreateTable
CREATE TABLE "FriendshipStatusLog" (
    "id" TEXT NOT NULL,
    "friendshipId" TEXT NOT NULL,
    "status" "FriendshipStatusEnum" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,

    CONSTRAINT "FriendshipStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FriendshipStatusLog_friendshipId_idx" ON "FriendshipStatusLog"("friendshipId");

-- CreateIndex
CREATE INDEX "MarkObject_markableType_markableObjectId_idx" ON "MarkObject"("markableType", "markableObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "MarkObject_userId_markableType_markableObjectId_marker_key" ON "MarkObject"("userId", "markableType", "markableObjectId", "marker");

-- CreateIndex
CREATE INDEX "Thread_type_idx" ON "Thread"("type");

-- AddForeignKey
ALTER TABLE "FriendshipStatusLog" ADD CONSTRAINT "FriendshipStatusLog_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friendship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendshipStatusLog" ADD CONSTRAINT "FriendshipStatusLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
