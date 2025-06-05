/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `message_group_messages` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `message_group_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "message_group_messages" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted",
ADD COLUMN     "deleted_by_owner" TIMESTAMP(3),
ADD COLUMN     "is_deleted_by_owner" BOOLEAN NOT NULL DEFAULT false;
