/*
  Warnings:

  - Changed the type of `pages` on the `Book` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "pages",
ADD COLUMN     "pages" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Book_title_price_pages_language_createdAt_idx" ON "Book"("title", "price", "pages", "language", "createdAt");
