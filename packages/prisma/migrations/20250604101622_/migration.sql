/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `message_groups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "message_groups_name_key" ON "message_groups"("name");
