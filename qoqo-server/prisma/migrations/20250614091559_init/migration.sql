-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `phone_num` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `gym_name` VARCHAR(191) NOT NULL,
    `user_image` VARCHAR(191) NOT NULL DEFAULT '/images/users/default.jpg',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_phone_num_key`(`phone_num`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equip_name` VARCHAR(191) NOT NULL,
    `equip_type` VARCHAR(191) NOT NULL,
    `equip_image` VARCHAR(191) NOT NULL,
    `gym_name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `desired_time` INTEGER NOT NULL,
    `reserved_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `late_policy` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED', 'ONE_SKIPPED') NOT NULL DEFAULT 'WAITING',

    INDEX `Reservation_equipment_id_fkey`(`equipment_id`),
    INDEX `Reservation_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Usage_equipment_id_fkey`(`equipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `Equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usage` ADD CONSTRAINT `Usage_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `Equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
