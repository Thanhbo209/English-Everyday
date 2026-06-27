-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PRONOUN', 'PREPOSITION', 'CONJUNCTION', 'INTERJECTION', 'DETERMINER');

-- CreateTable
CREATE TABLE "vocab_sets" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocab_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_items" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "phonetic" TEXT,
    "partOfSpeech" TEXT NOT NULL,
    "exampleSentence" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "vocab_sets_classroomId_idx" ON "vocab_sets"("classroomId");

-- CreateIndex
CREATE INDEX "vocab_sets_teacherId_idx" ON "vocab_sets"("teacherId");

-- CreateIndex
CREATE INDEX "vocab_items_setId_idx" ON "vocab_items"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "vocab_items_setId_orderIndex_key" ON "vocab_items"("setId", "orderIndex");

-- AddForeignKey
ALTER TABLE "vocab_sets" ADD CONSTRAINT "vocab_sets_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_sets" ADD CONSTRAINT "vocab_sets_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_items" ADD CONSTRAINT "vocab_items_setId_fkey" FOREIGN KEY ("setId") REFERENCES "vocab_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
