/*
  Warnings:

  - You are about to drop the `_ChatRoomToMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChatRoomToMessage" DROP CONSTRAINT "_ChatRoomToMessage_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatRoomToMessage" DROP CONSTRAINT "_ChatRoomToMessage_B_fkey";

-- DropTable
DROP TABLE "_ChatRoomToMessage";

-- CreateTable
CREATE TABLE "chat_room_messages" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "chatRoomId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "chat_room_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_messages_chatRoomId_messageId_key" ON "chat_room_messages"("chatRoomId", "messageId");

-- AddForeignKey
ALTER TABLE "chat_room_messages" ADD CONSTRAINT "chat_room_messages_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_messages" ADD CONSTRAINT "chat_room_messages_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
