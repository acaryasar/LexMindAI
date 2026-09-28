-- AlterTable
ALTER TABLE "case_notes" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "client_notes" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "client_timeline" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "document_versions" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "task_comments" ALTER COLUMN "createdBy" DROP NOT NULL;
