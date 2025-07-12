/*
  Warnings:

  - The `privacy` column on the `Cliq` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Cliq" DROP COLUMN "privacy",
ADD COLUMN     "privacy" TEXT NOT NULL DEFAULT 'private';

-- CreateTable
CREATE TABLE "InviteRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliqId" TEXT NOT NULL,
    "invitedRole" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "InviteRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InviteRequest" ADD CONSTRAINT "InviteRequest_cliqId_fkey" FOREIGN KEY ("cliqId") REFERENCES "Cliq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteRequest" ADD CONSTRAINT "InviteRequest_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
