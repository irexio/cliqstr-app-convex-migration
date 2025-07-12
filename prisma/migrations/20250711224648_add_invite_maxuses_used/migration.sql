/*
  Warnings:

  - Added the required column `maxUses` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "maxUses" INTEGER NOT NULL,
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;
