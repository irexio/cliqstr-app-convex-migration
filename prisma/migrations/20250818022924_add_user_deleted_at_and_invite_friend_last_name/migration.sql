/*
  Warnings:

  - The `status` column on the `Invite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `approved` on the `ParentLink` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[joinCode]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parentId,childId]` on the table `ParentLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,childId]` on the table `ParentLink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthdate` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetEmailNormalized` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetState` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Made the column `parentId` on table `ParentLink` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `ParentLink` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "TargetState" AS ENUM ('new', 'existing_parent', 'existing_user_non_parent', 'invalid_child');

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_cliqId_fkey";

-- DropForeignKey
ALTER TABLE "ParentLink" DROP CONSTRAINT "ParentLink_parentId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "birthdate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ChildSettings" ADD COLUMN     "canCreateCliqs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canInviteAdults" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canInviteChildren" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canJoinPublicCliqs" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Cliq" ADD COLUMN     "maxAge" INTEGER,
ADD COLUMN     "minAge" INTEGER;

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "friendLastName" TEXT,
ADD COLUMN     "joinCode" TEXT,
ADD COLUMN     "parentAccountExists" BOOLEAN,
ADD COLUMN     "targetEmailNormalized" VARCHAR(320) NOT NULL,
ADD COLUMN     "targetState" "TargetState" NOT NULL,
ADD COLUMN     "targetUserId" TEXT,
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "cliqId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "invitedRole" DROP NOT NULL,
ALTER COLUMN "maxUses" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ParentLink" DROP COLUMN "approved",
ADD COLUMN     "inviteContext" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'family',
ALTER COLUMN "parentId" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isParent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CliqNotice" (
    "id" TEXT NOT NULL,
    "cliqId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CliqNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "detail" TEXT,
    "debugId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CliqNotice_cliqId_idx" ON "CliqNotice"("cliqId");

-- CreateIndex
CREATE INDEX "CliqNotice_expiresAt_idx" ON "CliqNotice"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_joinCode_key" ON "Invite"("joinCode");

-- CreateIndex
CREATE INDEX "Invite_targetEmailNormalized_idx" ON "Invite"("targetEmailNormalized");

-- CreateIndex
CREATE INDEX "Invite_status_used_idx" ON "Invite"("status", "used");

-- CreateIndex
CREATE INDEX "Invite_token_idx" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ParentLink_parentId_childId_key" ON "ParentLink"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentLink_email_childId_key" ON "ParentLink"("email", "childId");

-- AddForeignKey
ALTER TABLE "CliqNotice" ADD CONSTRAINT "CliqNotice_cliqId_fkey" FOREIGN KEY ("cliqId") REFERENCES "Cliq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_cliqId_fkey" FOREIGN KEY ("cliqId") REFERENCES "Cliq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentAuditLog" ADD CONSTRAINT "ParentAuditLog_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityLog" ADD CONSTRAINT "UserActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
