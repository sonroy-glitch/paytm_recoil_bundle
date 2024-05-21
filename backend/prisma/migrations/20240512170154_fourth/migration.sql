/*
  Warnings:

  - Added the required column `pin` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "pin" INTEGER NOT NULL;
