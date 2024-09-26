/*
  Warnings:

  - A unique constraint covering the columns `[emailId]` on the table `Email` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_emailId_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "emailId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Email_emailId_key" ON "Email"("emailId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("emailId") ON DELETE RESTRICT ON UPDATE CASCADE;
