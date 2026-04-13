import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { facultyOrAdminMiddleware } from '../middleware/facultyOrAdmin';

const router = express.Router();

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

async function assertCanManagePatient(
  patientId: number,
  userId: string,
  role: string | undefined
) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { ok: false as const, reason: 'not_found' as const };
  if (role === 'admin') return { ok: true as const, patient };
  if (patient.facultyCreatorId === userId) return { ok: true as const, patient };
  return { ok: false as const, reason: 'forbidden' as const };
}

router.use(authMiddleware);
router.use(facultyOrAdminMiddleware);

// GET /api/assignments — list assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    const patientIdParam = req.query.patientId;
    const patientFilter =
      patientIdParam === undefined || patientIdParam === ''
        ? null
        : parsePositiveInt(Array.isArray(patientIdParam) ? patientIdParam[0] : patientIdParam);

    if (patientIdParam !== undefined && patientIdParam !== '' && patientFilter === null) {
      res.status(400).json({ error: 'Invalid patientId' });
      return;
    }

    if (req.userRole === 'admin') {
      const assignments = await prisma.caseAssignment.findMany({
        where: patientFilter ? { patientId: patientFilter } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: true,
          student: { select: { id: true, username: true, email: true } },
          assignedByFaculty: { select: { id: true, username: true, email: true } },
        },
      });
      res.json({ assignments });
      return;
    }

    const facultyId = req.userId as string;
    const assignments = await prisma.caseAssignment.findMany({
      where: {
        patient: { facultyCreatorId: facultyId },
        ...(patientFilter ? { patientId: patientFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        student: { select: { id: true, username: true, email: true } },
        assignedByFaculty: { select: { id: true, username: true, email: true } },
      },
    });

    res.json({ assignments });
  } catch (error) {
    console.error('GET /api/assignments error:', error);
    res.status(500).json({ error: 'Failed to list assignments' });
  }
});

// POST /api/assignments — assign student to case
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const patientId = parsePositiveInt((body as { patientId?: unknown }).patientId);
    const studentId = (body as { studentId?: unknown }).studentId;

    if (patientId === null || typeof studentId !== 'string' || !studentId.trim()) {
      res.status(400).json({ error: 'patientId and studentId are required' });
      return;
    }

    const access = await assertCanManagePatient(patientId, req.userId!, req.userRole);
    if (!access.ok) {
      if (access.reason === 'not_found') {
        res.status(404).json({ error: 'Case not found' });
        return;
      }
      res.status(403).json({ error: 'You can only assign students to cases you created' });
      return;
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId.trim() },
      select: { id: true, role: true },
    });

    if (!student || student.role !== 'student') {
      res.status(400).json({ error: 'Target user must be a student' });
      return;
    }

    const assignment = await prisma.caseAssignment.create({
      data: {
        patientId,
        studentId: student.id,
        assignedByFacultyId: req.userId!,
      },
      include: {
        patient: true,
        student: { select: { id: true, username: true, email: true } },
        assignedByFaculty: { select: { id: true, username: true, email: true } },
      },
    });

    res.status(201).json({ assignment });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      res.status(409).json({ error: 'This student is already assigned to this case' });
      return;
    }
    console.error('POST /api/assignments error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

export default router;
