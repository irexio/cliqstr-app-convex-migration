/*
  Warnings:

  - The values [off] on the enum `AIModerationLevel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `email` on the `ParentLink` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cliq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InviteRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Membership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParentAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `parentId` to the `ParentLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AIModerationLevel_new" AS ENUM ('strict', 'moderate', 'relaxed');
ALTER TABLE "Profile" ALTER COLUMN "aiModerationLevel" DROP DEFAULT;
ALTER TABLE "Profile" ALTER COLUMN "aiModerationLevel" TYPE "AIModerationLevel_new" USING ("aiModerationLevel"::text::"AIModerationLevel_new");
ALTER TYPE "AIModerationLevel" RENAME TO "AIModerationLevel_old";
ALTER TYPE "AIModerationLevel_new" RENAME TO "AIModerationLevel";
DROP TYPE "AIModerationLevel_old";
ALTER TABLE "Profile" ALTER COLUMN "aiModerationLevel" SET DEFAULT 'strict';
COMMIT;

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Cliq" DROP CONSTRAINT "Cliq_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "InviteRequest" DROP CONSTRAINT "InviteRequest_cliqId_fkey";

-- DropForeignKey
ALTER TABLE "InviteRequest" DROP CONSTRAINT "InviteRequest_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_cliqId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "ParentLink" DROP CONSTRAINT "ParentLink_childId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_cliqId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_postId_fkey";

-- AlterTable
ALTER TABLE "ParentLink" DROP COLUMN "email",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpires";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Cliq";

-- DropTable
DROP TABLE "Invite";

-- DropTable
DROP TABLE "InviteRequest";

-- DropTable
DROP TABLE "Membership";

-- DropTable
DROP TABLE "ParentAuditLog";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Reply";

-- DropEnum
DROP TYPE "CliqPrivacy";

-- DropEnum
DROP TYPE "InviteStatus";

-- DropEnum
DROP TYPE "MembershipRole";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "ChildSettings" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "canCreatePublicCliqs" BOOLEAN NOT NULL DEFAULT false,
    "canSendInvites" BOOLEAN NOT NULL DEFAULT false,
    "isSilentlyMonitored" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChildSettings_profileId_key" ON "ChildSettings"("profileId");

-- AddForeignKey
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildSettings" ADD CONSTRAINT "ChildSettings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
