import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { facultyOrAdminMiddleware } from '../middleware/facultyOrAdmin';

const router = express.Router();

function paramString(id: string | string[] | undefined): string {
  const raw = Array.isArray(id) ? id[0] : id;
  return typeof raw === 'string' ? raw : String(raw ?? '');
}

function parseCaseId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

router.use(authMiddleware);
router.use(facultyOrAdminMiddleware);

// GET /api/faculty/students — list all student accounts
router.get('/students', async (_req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: { id: true, username: true, email: true, createdAt: true },
      orderBy: { username: 'asc' },
    });
    res.json({ students });
  } catch (error) {
    console.error('GET /api/faculty/students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/faculty/cases — cases created by this faculty (or all for admin)
router.get('/cases', async (req: Request, res: Response) => {
  try {
    const where =
      req.userRole === 'admin' ? {} : { facultyCreatorId: req.userId };

    const cases = await prisma.patient.findMany({
      where,
      include: { assignments: { include: { student: { select: { id: true, username: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ cases });
  } catch (error) {
    console.error('GET /api/faculty/cases error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// GET /api/faculty/cases/:id — specific case with assignments
router.get('/cases/:id', async (req: Request, res: Response) => {
  try {
    const caseId = parseCaseId(paramString(req.params.id));
    if (!caseId) {
      res.status(400).json({ error: 'Invalid case id' });
      return;
    }

    const patient = await prisma.patient.findUnique({
      where: { id: caseId },
      include: {
        assignments: {
          include: { student: { select: { id: true, username: true, email: true } } },
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    // Faculty can only view their own cases (admin sees all)
    if (req.userRole !== 'admin' && patient.facultyCreatorId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ case: patient });
  } catch (error) {
    console.error('GET /api/faculty/cases/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// GET /api/faculty/cases/:id/notes — student notes for a case
router.get('/cases/:id/notes', async (req: Request, res: Response) => {
  try {
    const caseId = parseCaseId(paramString(req.params.id));
    if (!caseId) {
      res.status(400).json({ error: 'Invalid case id' });
      return;
    }

    const patient = await prisma.patient.findUnique({ where: { id: caseId } });
    if (!patient) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    if (req.userRole !== 'admin' && patient.facultyCreatorId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const notes = await prisma.note.findMany({
      where: { patientId: caseId },
      include: { student: { select: { id: true, username: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ notes });
  } catch (error) {
    console.error('GET /api/faculty/cases/:id/notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

export default router;
