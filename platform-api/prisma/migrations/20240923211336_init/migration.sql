/*
  Warnings:

  - You are about to drop the column `messageId` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `fromEmailId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `toEmailId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `emailId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_fromEmailId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_toEmailId_fkey";

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "messageId",
ADD COLUMN     "from" VARCHAR(255),
ADD COLUMN     "to" VARCHAR(255);

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fromEmailId",
DROP COLUMN "toEmailId",
ADD COLUMN     "emailId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
