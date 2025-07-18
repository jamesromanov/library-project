/*
  Warnings:

  - You are about to drop the column `name` on the `Admin` table. All the data in the column will be lost.
  - Added the required column `birthday` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "name",
ADD COLUMN     "birthday" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "postalCode" TEXT NOT NULL;
