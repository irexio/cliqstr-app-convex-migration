/*
  Warnings:

  - You are about to drop the column `isApproved` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `role` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "isApproved",
DROP COLUMN "role";
