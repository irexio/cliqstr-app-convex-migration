/*
  Warnings:

  - The `privacy` column on the `Cliq` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Invite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `Membership` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Cliq` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `invitedRole` on the `Invite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `invitedRole` on the `InviteRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `InviteRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `Profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Parent', 'Child', 'Adult');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('Owner', 'Moderator', 'Member');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'approved', 'used', 'expired');

-- CreateEnum
CREATE TYPE "CliqPrivacy" AS ENUM ('private', 'semi_private', 'public');

-- AlterTable
ALTER TABLE "Cliq" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "privacy",
ADD COLUMN     "privacy" "CliqPrivacy" NOT NULL DEFAULT 'private';

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "message" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'pending',
DROP COLUMN "invitedRole",
ADD COLUMN     "invitedRole" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "InviteRequest" DROP COLUMN "invitedRole",
ADD COLUMN     "invitedRole" "Role" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "InviteStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "role",
ADD COLUMN     "role" "MembershipRole" NOT NULL DEFAULT 'Member';

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageUrl",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "about" TEXT,
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "stripeStatus" DROP NOT NULL,
ALTER COLUMN "stripeStatus" DROP DEFAULT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
ALTER COLUMN "ageGroup" DROP NOT NULL,
ALTER COLUMN "ageGroup" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
