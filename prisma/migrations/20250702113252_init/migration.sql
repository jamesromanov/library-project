/*
  Warnings:

  - Added the required column `category` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookCatigories" AS ENUM ('Badiiy_Adabiyotlar', 'Rus_Adabiyotlar', 'Ozbek_Adabiyotlar', 'Prezident_Asarlari', 'Hikoyalar');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "category" "BookCatigories" NOT NULL;
