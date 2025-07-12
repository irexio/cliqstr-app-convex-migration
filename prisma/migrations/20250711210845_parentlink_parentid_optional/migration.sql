-- DropForeignKey
ALTER TABLE "ParentLink" DROP CONSTRAINT "ParentLink_parentId_fkey";

-- AlterTable
ALTER TABLE "ParentLink" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
