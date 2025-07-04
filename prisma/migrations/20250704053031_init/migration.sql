/*
  Warnings:

  - You are about to drop the column `image` on the `New` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `New` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "New" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "thumbnail" TEXT NOT NULL;
