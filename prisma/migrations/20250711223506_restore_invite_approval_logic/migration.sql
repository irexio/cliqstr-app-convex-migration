/*
  Warnings:

  - You are about to drop the column `code` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `invitedRole` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `inviteeEmail` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `used` on the `Invite` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_senderId_fkey";

-- DropIndex
DROP INDEX "Invite_code_key";

-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "code",
DROP COLUMN "expiresAt",
DROP COLUMN "invitedRole",
DROP COLUMN "inviteeEmail",
DROP COLUMN "senderId",
DROP COLUMN "used",
ADD COLUMN     "invitedUserId" TEXT,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;
