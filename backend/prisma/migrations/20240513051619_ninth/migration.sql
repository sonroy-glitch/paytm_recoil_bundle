/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Bank` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bank_username_key" ON "Bank"("username");
