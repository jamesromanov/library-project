/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Admin_refreshToken_key" ON "Admin"("refreshToken");
