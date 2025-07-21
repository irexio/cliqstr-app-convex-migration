-- Add child invite fields to the Invite table
ALTER TABLE "Invite" ADD COLUMN IF NOT EXISTS "friendFirstName" TEXT;
ALTER TABLE "Invite" ADD COLUMN IF NOT EXISTS "trustedAdultContact" TEXT;
ALTER TABLE "Invite" ADD COLUMN IF NOT EXISTS "inviteType" TEXT;
ALTER TABLE "Invite" ADD COLUMN IF NOT EXISTS "inviteNote" TEXT;
