/*
  Warnings:

  - You are about to alter the column `ipk` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `ipk` VARCHAR(191) NOT NULL;
