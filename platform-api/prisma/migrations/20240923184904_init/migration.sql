/*
  Warnings:

  - You are about to drop the column `date` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `_MessageFrom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MessageTo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `emailId` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromEmailId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toEmailId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Made the column `body` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "_MessageFrom" DROP CONSTRAINT "_MessageFrom_A_fkey";

-- DropForeignKey
ALTER TABLE "_MessageFrom" DROP CONSTRAINT "_MessageFrom_B_fkey";

-- DropForeignKey
ALTER TABLE "_MessageTo" DROP CONSTRAINT "_MessageTo_A_fkey";

-- DropForeignKey
ALTER TABLE "_MessageTo" DROP CONSTRAINT "_MessageTo_B_fkey";

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "emailId" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fromEmailId" INTEGER NOT NULL,
ADD COLUMN     "threadId" VARCHAR(255),
ADD COLUMN     "toEmailId" INTEGER NOT NULL,
ALTER COLUMN "ticketId" DROP NOT NULL,
ALTER COLUMN "subject" SET DATA TYPE TEXT,
ALTER COLUMN "body" SET NOT NULL;

-- DropTable
DROP TABLE "_MessageFrom";

-- DropTable
DROP TABLE "_MessageTo";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromEmailId_fkey" FOREIGN KEY ("fromEmailId") REFERENCES "Email"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_toEmailId_fkey" FOREIGN KEY ("toEmailId") REFERENCES "Email"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
