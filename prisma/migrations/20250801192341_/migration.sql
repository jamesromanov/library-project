/*
  Warnings:

  - You are about to drop the column `price` on the `Book` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Book_title_price_pages_language_createdAt_idx";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "price";

-- CreateIndex
CREATE INDEX "Book_title_pages_language_createdAt_idx" ON "Book"("title", "pages", "language", "createdAt");
