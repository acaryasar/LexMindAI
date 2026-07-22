/*
  Warnings:

  - A unique constraint covering the columns `[userId,key]` on the table `ai_memory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ai_memory_userId_key_key" ON "ai_memory"("userId", "key");
