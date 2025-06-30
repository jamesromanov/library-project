-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "New" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
