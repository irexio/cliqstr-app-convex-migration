-- Add isApproved column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;
