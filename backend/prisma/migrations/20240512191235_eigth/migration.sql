/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Friend_username_key" ON "Friend"("username");
