-- DropForeignKey
ALTER TABLE `Reservation` DROP FOREIGN KEY `Reservation_equipment_id_fkey`;

-- DropForeignKey
ALTER TABLE `Reservation` DROP FOREIGN KEY `Reservation_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Usage` DROP FOREIGN KEY `Usage_equipment_id_fkey`;

-- DropForeignKey
ALTER TABLE `Usage` DROP FOREIGN KEY `Usage_user_id_fkey`;

-- DropIndex
DROP INDEX `Reservation_equipment_id_fkey` ON `Reservation`;

-- DropIndex
DROP INDEX `Reservation_user_id_fkey` ON `Reservation`;

-- DropIndex
DROP INDEX `Usage_equipment_id_fkey` ON `Usage`;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `Equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usage` ADD CONSTRAINT `Usage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usage` ADD CONSTRAINT `Usage_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `Equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
