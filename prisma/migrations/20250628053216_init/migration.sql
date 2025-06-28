-- DropIndex
DROP INDEX "New_updatedAt_language_idx";

-- CreateIndex
CREATE INDEX "New_updatedAt_language_createdAt_idx" ON "New"("updatedAt", "language", "createdAt");
