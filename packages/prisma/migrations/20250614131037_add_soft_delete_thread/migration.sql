/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `biodata` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ConversationThread" ADD COLUMN     "is_deleted_by_user_a" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deleted_by_user_b" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "group_thread_deletes" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "group_thread_deletes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_thread_deletes_threadId_userId_key" ON "group_thread_deletes"("threadId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "biodata_phone_key" ON "biodata"("phone");

-- AddForeignKey
ALTER TABLE "group_thread_deletes" ADD CONSTRAINT "group_thread_deletes_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ConversationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_thread_deletes" ADD CONSTRAINT "group_thread_deletes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
