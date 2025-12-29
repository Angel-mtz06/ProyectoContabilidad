-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "messageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';
