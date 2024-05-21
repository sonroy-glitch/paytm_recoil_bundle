/*
  Warnings:

  - Added the required column `username` to the `Friend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "username" TEXT NOT NULL;
