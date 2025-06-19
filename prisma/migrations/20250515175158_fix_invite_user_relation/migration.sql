/*
  Warnings:

  - Added the required column `invitedRole` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviterId` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "cliqId" TEXT,
ADD COLUMN     "invitedRole" TEXT NOT NULL,
ADD COLUMN     "inviterId" TEXT NOT NULL,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
