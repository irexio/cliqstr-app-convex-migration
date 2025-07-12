-- AlterTable
ALTER TABLE "ChildSettings" ADD COLUMN     "aiModerationLevel" TEXT,
ADD COLUMN     "canAccessGames" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canPostImages" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canShareYouTube" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibilityLevel" TEXT;
