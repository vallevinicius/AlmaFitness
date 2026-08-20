/*
  Warnings:

  - You are about to drop the column `address` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `order` table. All the data in the column will be lost.
  - Added the required column `cep` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cep` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `address`,
    ADD COLUMN `cep` VARCHAR(191) NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `complement` VARCHAR(191) NULL,
    ADD COLUMN `neighborhood` VARCHAR(191) NOT NULL,
    ADD COLUMN `number` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `street` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `address`,
    ADD COLUMN `cep` VARCHAR(191) NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `complement` VARCHAR(191) NULL,
    ADD COLUMN `neighborhood` VARCHAR(191) NOT NULL,
    ADD COLUMN `number` VARCHAR(191) NOT NULL,
    ADD COLUMN `shippingCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `street` VARCHAR(191) NOT NULL;
