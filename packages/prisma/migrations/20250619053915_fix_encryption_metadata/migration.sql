/*
  Warnings:

  - You are about to drop the column `conversation_id` on the `encryption_metadata` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `encryption_metadata` table. All the data in the column will be lost.
  - You are about to drop the column `encryptionKey` on the `encryption_metadata` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `encryption_metadata` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "encryption_metadata_conversation_id_key";

-- AlterTable
ALTER TABLE "encryption_metadata" DROP COLUMN "conversation_id",
DROP COLUMN "created_at",
DROP COLUMN "encryptionKey",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mac" TEXT,
ADD COLUMN     "version" TEXT DEFAULT 'v1';
