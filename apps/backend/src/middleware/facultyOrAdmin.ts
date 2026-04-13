import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

/**
 * Requires the authenticated user to have role "faculty" or "admin".
 * Also populates req.userRole for downstream handlers.
 */
export const facultyOrAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'faculty' && user.role !== 'admin') {
      res.status(403).json({ error: 'Faculty or admin access required' });
      return;
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('facultyOrAdminMiddleware error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
