-- AlterTable
ALTER TABLE `users` ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verificationCode` VARCHAR(191) NULL,
    ADD COLUMN `verificationCodeExpiry` DATETIME(3) NULL,
    MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL;
