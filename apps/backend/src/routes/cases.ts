import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { facultyOrAdminMiddleware } from '../middleware/facultyOrAdmin';
import { upload } from './uploads';

const router = express.Router();

function paramString(id: string | string[] | undefined): string {
  const raw = Array.isArray(id) ? id[0] : id;
  return typeof raw === 'string' ? raw : String(raw ?? '');
}

function parseCaseId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function patientToCase(p: {
  id: number;
  caseTitle: string | null;
  name: string;
  location: string;
  dob: Date;
  gender: string;
  codeStatus: string;
  caseType: string;
  hasLabs: boolean;
  profilePictureUrl: string | null;
  facultyCreatorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: p.id,
    name: p.caseTitle?.trim() ? p.caseTitle : p.name,
    patient: p.name,
    location: p.location,
    dob: p.dob,
    gender: p.gender,
    codeStatus: p.codeStatus,
    caseType: p.caseType,
    hasLabs: p.hasLabs,
    profilePictureUrl: p.profilePictureUrl,
    facultyCreatorId: p.facultyCreatorId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

router.use(authMiddleware);

// GET /api/cases — get all cases
router.get('/', async (_req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({ orderBy: { id: 'asc' } });
    res.json({ cases: patients.map(patientToCase) });
  } catch (error) {
    console.error('GET /api/cases error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// GET /api/cases/:id — get specific case
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const caseId = parseCaseId(paramString(req.params.id));
    if (!caseId) {
      res.status(400).json({ error: 'Invalid case id' });
      return;
    }

    const p = await prisma.patient.findUnique({ where: { id: caseId } });
    if (!p) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    res.json({ case: patientToCase(p) });
  } catch (error) {
    console.error('GET /api/cases/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// POST /api/cases — create new case (faculty/admin only)
router.post('/', facultyOrAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as {
      caseTitle?: unknown;
      name?: unknown;
      location?: unknown;
      dob?: unknown;
      gender?: unknown;
      codeStatus?: unknown;
      caseType?: unknown;
      hasLabs?: unknown;
    };

    const name = typeof body.name === 'string' ? body.name.trim() : null;
    const location = typeof body.location === 'string' ? body.location.trim() : null;
    const dob = typeof body.dob === 'string' ? new Date(body.dob) : null;
    const gender = typeof body.gender === 'string' ? body.gender.trim() : null;
    const codeStatus = typeof body.codeStatus === 'string' ? body.codeStatus.trim() : null;

    if (!name || !location || !dob || isNaN(dob.getTime()) || !gender || !codeStatus) {
      res.status(400).json({ error: 'name, location, dob, gender, and codeStatus are required' });
      return;
    }

    const caseTitle = typeof body.caseTitle === 'string' ? body.caseTitle.trim() : null;
    const caseType =
      body.caseType === 'sim' ? 'sim' : 'pbl';
    const hasLabs = body.hasLabs === true || body.hasLabs === 'true';

    const patient = await prisma.patient.create({
      data: {
        name,
        location,
        dob,
        gender,
        codeStatus,
        caseTitle: caseTitle || null,
        caseType,
        hasLabs,
        facultyCreatorId: req.userId ?? null,
      },
    });

    res.status(201).json({ case: patientToCase(patient) });
  } catch (error) {
    console.error('POST /api/cases error:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// POST /api/cases/:id/picture — upload patient profile picture (faculty/admin only)
router.post(
  '/:id/picture',
  facultyOrAdminMiddleware,
  upload.single('picture'),
  async (req: Request, res: Response) => {
    try {
      const caseId = parseCaseId(paramString(req.params.id));
      if (!caseId) {
        res.status(400).json({ error: 'Invalid case id' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No image file provided (field: picture)' });
        return;
      }

      const profilePictureUrl = `/uploads/${req.file.filename}`;

      await prisma.patient.update({
        where: { id: caseId },
        data: { profilePictureUrl },
      });

      res.json({ profilePictureUrl });
    } catch (error) {
      console.error('POST /api/cases/:id/picture error:', error);
      res.status(500).json({ error: 'Failed to upload picture' });
    }
  }
);

export default router;
