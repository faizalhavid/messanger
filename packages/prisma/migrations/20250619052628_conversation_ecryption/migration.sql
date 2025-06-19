-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "encryptionMetadataId" TEXT;

-- CreateTable
CREATE TABLE "encryption_metadata" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "encryptionKey" VARCHAR(255) NOT NULL,
    "iv" VARCHAR(255),

    CONSTRAINT "encryption_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "encryption_metadata_conversation_id_key" ON "encryption_metadata"("conversation_id");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_encryptionMetadataId_fkey" FOREIGN KEY ("encryptionMetadataId") REFERENCES "encryption_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
