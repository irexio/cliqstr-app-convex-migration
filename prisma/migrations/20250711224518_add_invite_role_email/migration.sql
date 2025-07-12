/*
  Warnings:

  - Added the required column `invitedRole` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviteeEmail` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "invitedRole" TEXT NOT NULL,
ADD COLUMN     "inviteeEmail" TEXT NOT NULL;
