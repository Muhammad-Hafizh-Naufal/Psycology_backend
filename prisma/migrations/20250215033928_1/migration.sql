/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `user` table. All the data in the column will be lost.
  - Added the required column `ipk` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelas` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noHP` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `fileUrl`,
    ADD COLUMN `certificateUrl` VARCHAR(191) NULL,
    ADD COLUMN `cvUrl` VARCHAR(191) NULL,
    ADD COLUMN `ipk` DOUBLE NOT NULL,
    ADD COLUMN `kelas` VARCHAR(191) NOT NULL,
    ADD COLUMN `krsUrl` VARCHAR(191) NULL,
    ADD COLUMN `ktmUrl` VARCHAR(191) NULL,
    ADD COLUMN `ktpUrl` VARCHAR(191) NULL,
    ADD COLUMN `noHP` VARCHAR(191) NOT NULL,
    ADD COLUMN `pasFotoUrl` VARCHAR(191) NULL,
    ADD COLUMN `rangkumanNilaiUrl` VARCHAR(191) NULL;
