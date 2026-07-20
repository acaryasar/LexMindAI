-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiApiKey" TEXT,
ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "aiProvider" TEXT,
ADD COLUMN     "aiSettings" JSONB;
