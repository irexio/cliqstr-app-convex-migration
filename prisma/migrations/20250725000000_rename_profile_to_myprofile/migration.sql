-- AlterTable - Rename Profile to MyProfile
ALTER TABLE "Profile" RENAME TO "MyProfile";

-- Update foreign key constraints
ALTER TABLE "ChildSettings" RENAME CONSTRAINT "ChildSettings_profileId_fkey" TO "ChildSettings_profileId_fkey_temp";
ALTER TABLE "ChildSettings" DROP CONSTRAINT "ChildSettings_profileId_fkey_temp";
ALTER TABLE "ChildSettings" ADD CONSTRAINT "ChildSettings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScrapbookItem" RENAME CONSTRAINT "ScrapbookItem_profileId_fkey" TO "ScrapbookItem_profileId_fkey_temp";
ALTER TABLE "ScrapbookItem" DROP CONSTRAINT "ScrapbookItem_profileId_fkey_temp";
ALTER TABLE "ScrapbookItem" ADD CONSTRAINT "ScrapbookItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update indexes
ALTER INDEX "Profile_pkey" RENAME TO "MyProfile_pkey";
ALTER INDEX "Profile_userId_key" RENAME TO "MyProfile_userId_key";
ALTER INDEX "Profile_username_key" RENAME TO "MyProfile_username_key";