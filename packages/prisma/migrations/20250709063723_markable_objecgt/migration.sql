-- CreateEnum
CREATE TYPE "MarkableType" AS ENUM ('CONVERSATION', 'THREAD', 'FRIENDSHIP');

-- CreateTable
CREATE TABLE "MarkObject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "markableType" "MarkableType" NOT NULL,
    "markableObjectId" TEXT NOT NULL,
    "marker" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarkObject_markableType_markableObjectId_idx" ON "MarkObject"("markableType", "markableObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "MarkObject_userId_markableType_markableObjectId_marker_key" ON "MarkObject"("userId", "markableType", "markableObjectId", "marker");

-- AddForeignKey
ALTER TABLE "MarkObject" ADD CONSTRAINT "MarkObject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkObject" ADD CONSTRAINT "conversation_status_marks" FOREIGN KEY ("markableObjectId") REFERENCES "conversation_status"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkObject" ADD CONSTRAINT "friendship_marks" FOREIGN KEY ("markableObjectId") REFERENCES "Friendship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkObject" ADD CONSTRAINT "thread_marks" FOREIGN KEY ("markableObjectId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
