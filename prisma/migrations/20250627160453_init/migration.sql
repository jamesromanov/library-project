-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE INDEX "Book_title_price_pages_language_createdAt_idx" ON "Book"("title", "price", "pages", "language", "createdAt");

-- CreateIndex
CREATE INDEX "New_updatedAt_idx" ON "New"("updatedAt");
