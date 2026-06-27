-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'S1', 'S2', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'GRADED');

-- CreateEnum
CREATE TYPE "MasteryStatus" AS ENUM ('NEW', 'LEARNING', 'KNOWN');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('WAITING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('WEEK', 'MONTH', 'ALL');

-- AddPrimaryKey
ALTER TABLE "vocab_items" ADD CONSTRAINT "vocab_items_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "vocabSetId" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "timeTakenSec" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vocabSetId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "score" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabMastery" (
    "studentId" TEXT NOT NULL,
    "vocabItemId" TEXT NOT NULL,
    "status" "MasteryStatus" NOT NULL DEFAULT 'NEW',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "VocabMastery_pkey" PRIMARY KEY ("studentId","vocabItemId")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "vocabSetId" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'WAITING',
    "pin" TEXT NOT NULL,
    "scores" JSONB NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSessionPlayer" (
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER,

    CONSTRAINT "LiveSessionPlayer_pkey" PRIMARY KEY ("sessionId","studentId")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "entries" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_classroomId_idx" ON "Assignment"("classroomId");
CREATE INDEX "Assignment_teacherId_idx" ON "Assignment"("teacherId");
CREATE INDEX "Assignment_vocabSetId_idx" ON "Assignment"("vocabSetId");
CREATE INDEX "Assignment_activityType_idx" ON "Assignment"("activityType");
CREATE INDEX "Assignment_dueAt_idx" ON "Assignment"("dueAt");

-- CreateIndex
CREATE INDEX "Submission_assignmentId_idx" ON "Submission"("assignmentId");
CREATE INDEX "Submission_studentId_idx" ON "Submission"("studentId");
CREATE INDEX "Submission_status_idx" ON "Submission"("status");
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");

-- CreateIndex
CREATE INDEX "ProgressRecord_studentId_idx" ON "ProgressRecord"("studentId");
CREATE INDEX "ProgressRecord_vocabSetId_idx" ON "ProgressRecord"("vocabSetId");
CREATE INDEX "ProgressRecord_activityType_idx" ON "ProgressRecord"("activityType");
CREATE INDEX "ProgressRecord_recordedAt_idx" ON "ProgressRecord"("recordedAt");

-- CreateIndex
CREATE INDEX "VocabMastery_studentId_status_idx" ON "VocabMastery"("studentId", "status");
CREATE INDEX "VocabMastery_vocabItemId_idx" ON "VocabMastery"("vocabItemId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveSession_pin_key" ON "LiveSession"("pin");
CREATE INDEX "LiveSession_classroomId_idx" ON "LiveSession"("classroomId");
CREATE INDEX "LiveSession_teacherId_idx" ON "LiveSession"("teacherId");
CREATE INDEX "LiveSession_vocabSetId_idx" ON "LiveSession"("vocabSetId");
CREATE INDEX "LiveSession_activityType_idx" ON "LiveSession"("activityType");
CREATE INDEX "LiveSession_status_idx" ON "LiveSession"("status");
CREATE INDEX "LiveSession_pin_idx" ON "LiveSession"("pin");

-- CreateIndex
CREATE INDEX "LiveSessionPlayer_studentId_idx" ON "LiveSessionPlayer"("studentId");
CREATE INDEX "LiveSessionPlayer_score_idx" ON "LiveSessionPlayer"("score");
CREATE INDEX "LiveSessionPlayer_rank_idx" ON "LiveSessionPlayer"("rank");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_classroomId_idx" ON "LeaderboardSnapshot"("classroomId");
CREATE INDEX "LeaderboardSnapshot_period_idx" ON "LeaderboardSnapshot"("period");
CREATE INDEX "LeaderboardSnapshot_computedAt_idx" ON "LeaderboardSnapshot"("computedAt");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_vocabSetId_fkey" FOREIGN KEY ("vocabSetId") REFERENCES "vocab_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecord" ADD CONSTRAINT "ProgressRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressRecord" ADD CONSTRAINT "ProgressRecord_vocabSetId_fkey" FOREIGN KEY ("vocabSetId") REFERENCES "vocab_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabMastery" ADD CONSTRAINT "VocabMastery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VocabMastery" ADD CONSTRAINT "VocabMastery_vocabItemId_fkey" FOREIGN KEY ("vocabItemId") REFERENCES "vocab_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_vocabSetId_fkey" FOREIGN KEY ("vocabSetId") REFERENCES "vocab_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSessionPlayer" ADD CONSTRAINT "LiveSessionPlayer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveSessionPlayer" ADD CONSTRAINT "LiveSessionPlayer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
