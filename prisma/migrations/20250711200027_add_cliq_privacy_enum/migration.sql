-- CreateEnum
CREATE TYPE "CliqPrivacy" AS ENUM ('private', 'semi_private', 'public');

-- AlterTable
ALTER TABLE "Cliq" ADD COLUMN     "privacy" "CliqPrivacy" NOT NULL DEFAULT 'private';
