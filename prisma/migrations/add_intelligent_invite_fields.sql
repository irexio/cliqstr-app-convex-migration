-- Migration: Add intelligent invite fields and backfill existing data
-- This adds the new fields while preserving existing functionality

-- Step 1: Add enums
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'completed', 'canceled');
CREATE TYPE "TargetState" AS ENUM ('new', 'existing_parent', 'existing_user_non_parent', 'invalid_child');

-- Step 2: Add new columns (nullable initially for backfill)
ALTER TABLE "Invite" ADD COLUMN "token" TEXT;
ALTER TABLE "Invite" ADD COLUMN "targetEmailNormalized" VARCHAR(320);
ALTER TABLE "Invite" ADD COLUMN "targetUserId" TEXT;
ALTER TABLE "Invite" ADD COLUMN "targetState" "TargetState";
ALTER TABLE "Invite" ADD COLUMN "status" "InviteStatus" DEFAULT 'pending';
ALTER TABLE "Invite" ADD COLUMN "acceptedAt" TIMESTAMP(3);
ALTER TABLE "Invite" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "Invite" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Step 3: Backfill existing data
-- Set token = code for existing invites
UPDATE "Invite" SET "token" = "code" WHERE "token" IS NULL AND "code" IS NOT NULL;

-- Generate tokens for invites without codes
UPDATE "Invite" SET "token" = 'legacy_' || "id" WHERE "token" IS NULL;

-- Normalize emails
UPDATE "Invite" SET "targetEmailNormalized" = LOWER(TRIM("inviteeEmail")) WHERE "targetEmailNormalized" IS NULL;

-- Set updatedAt to createdAt for existing records
UPDATE "Invite" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Backfill targetState and targetUserId based on existing user lookup
UPDATE "Invite" SET 
  "targetUserId" = u."id",
  "targetState" = CASE 
    WHEN a."role" = 'Parent' THEN 'existing_parent'::TargetState
    WHEN a."role" = 'Child' THEN 'invalid_child'::TargetState
    WHEN a."role" IS NOT NULL AND a."role" != 'Parent' AND a."role" != 'Child' THEN 'existing_user_non_parent'::TargetState
    ELSE 'new'::TargetState
  END
FROM "User" u
LEFT JOIN "Account" a ON u."id" = a."userId"
WHERE "Invite"."targetEmailNormalized" = LOWER(TRIM(u."email"))
  AND "Invite"."targetState" IS NULL;

-- Set remaining invites (no matching user) to 'new'
UPDATE "Invite" SET "targetState" = 'new' WHERE "targetState" IS NULL;

-- Step 4: Make required fields non-nullable
ALTER TABLE "Invite" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "Invite" ALTER COLUMN "targetEmailNormalized" SET NOT NULL;
ALTER TABLE "Invite" ALTER COLUMN "targetState" SET NOT NULL;
ALTER TABLE "Invite" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Step 5: Add constraints and indexes
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_token_key" UNIQUE ("token");
CREATE INDEX "Invite_targetEmailNormalized_idx" ON "Invite"("targetEmailNormalized");
CREATE INDEX "Invite_status_used_idx" ON "Invite"("status", "used");
CREATE INDEX "Invite_token_idx" ON "Invite"("token");

-- Step 6: Make cliqId nullable (some invites may not be tied to specific cliqs)
ALTER TABLE "Invite" ALTER COLUMN "cliqId" DROP NOT NULL;

-- Step 7: Update foreign key constraints to handle nullable cliqId
ALTER TABLE "Invite" DROP CONSTRAINT IF EXISTS "Invite_cliqId_fkey";
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_cliqId_fkey" 
  FOREIGN KEY ("cliqId") REFERENCES "Cliq"("id") ON DELETE SET NULL ON UPDATE CASCADE;
