-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'unassigned';

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "caseTitle" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "gender" TEXT NOT NULL,
    "codeStatus" TEXT NOT NULL,
    "caseType" TEXT NOT NULL DEFAULT 'pbl',
    "hasLabs" BOOLEAN NOT NULL DEFAULT false,
    "profilePictureUrl" TEXT,
    "facultyCreatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiefComplaint" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "complaintText" TEXT NOT NULL,

    CONSTRAINT "ChiefComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "hpi" TEXT NOT NULL DEFAULT '',
    "physicalExam" TEXT NOT NULL DEFAULT '',
    "assessment" TEXT,
    "treatmentPlan" TEXT,
    "medications" TEXT,
    "allergies" TEXT,
    "familyHistory" TEXT,
    "socialHistory" TEXT,
    "procedures" TEXT,
    "diagnosis" TEXT,
    "labAndDiagnostics" TEXT,
    "codingAndBilling" TEXT,
    "learningIssues" TEXT,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAssignment" (
    "id" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedByFacultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actorUserId" TEXT,
    "targetUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Patient_facultyCreatorId_idx" ON "Patient"("facultyCreatorId");

-- CreateIndex
CREATE INDEX "ChiefComplaint_patientId_idx" ON "ChiefComplaint"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_studentId_patientId_key" ON "Note"("studentId", "patientId");

-- CreateIndex
CREATE INDEX "CaseAssignment_patientId_idx" ON "CaseAssignment"("patientId");

-- CreateIndex
CREATE INDEX "CaseAssignment_studentId_idx" ON "CaseAssignment"("studentId");

-- CreateIndex
CREATE INDEX "CaseAssignment_assignedByFacultyId_idx" ON "CaseAssignment"("assignedByFacultyId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseAssignment_patientId_studentId_key" ON "CaseAssignment"("patientId", "studentId");

-- CreateIndex
CREATE INDEX "AuditLog_eventType_createdAt_idx" ON "AuditLog"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_facultyCreatorId_fkey" FOREIGN KEY ("facultyCreatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiefComplaint" ADD CONSTRAINT "ChiefComplaint_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_assignedByFacultyId_fkey" FOREIGN KEY ("assignedByFacultyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
