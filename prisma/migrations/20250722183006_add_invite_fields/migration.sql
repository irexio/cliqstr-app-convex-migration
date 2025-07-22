/*
  Warnings:

  - You are about to drop the column `isApproved` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "friendFirstName" TEXT,
ADD COLUMN     "inviteNote" TEXT,
ADD COLUMN     "inviteType" TEXT,
ADD COLUMN     "trustedAdultContact" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isApproved";
