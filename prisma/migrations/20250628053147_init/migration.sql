/*
  Warnings:

  - Added the required column `language` to the `New` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "New_updatedAt_idx";

-- AlterTable
ALTER TABLE "New" ADD COLUMN     "language" "Languages" NOT NULL;

-- CreateIndex
CREATE INDEX "New_updatedAt_language_idx" ON "New"("updatedAt", "language");
