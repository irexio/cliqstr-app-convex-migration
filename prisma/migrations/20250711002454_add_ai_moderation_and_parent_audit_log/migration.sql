-- CreateEnum
CREATE TYPE "AIModerationLevel" AS ENUM ('strict', 'moderate', 'off');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "aiModerationLevel" "AIModerationLevel" NOT NULL DEFAULT 'strict';

-- CreateTable
CREATE TABLE "ParentAuditLog" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentAuditLog_pkey" PRIMARY KEY ("id")
);
