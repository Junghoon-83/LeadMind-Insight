import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { solutions as staticSolutions } from '@/data/solutions';
import { logger, logApiError } from '@/lib/logger';

// GET - Fetch solutions
export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const dbSolutions = await prisma.solution.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            actions: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        });

        if (dbSolutions.length > 0) {
          const solutions: Record<string, unknown> = {};
          dbSolutions.forEach((s) => {
            solutions[s.code] = {
              id: s.code,
              combination: s.combination,
              title: s.title,
              coreIssue: s.coreIssue,
              fieldVoices: s.fieldVoices as string[],
              diagnosis: s.diagnosis,
              actions: s.actions.map((a) => ({
                title: a.title,
                method: a.method,
                effect: a.effect,
                leadershipTip: a.leadershipTip,
              })),
            };
          });
          return NextResponse.json({ solutions });
        }
      } catch (e) {
        logger.warn('DB query failed, falling back to static data', {
          table: 'solution',
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }

    return NextResponse.json({ solutions: staticSolutions });
  } catch (error) {
    logApiError('GET', '/api/solutions', error);
    return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 });
  }
}
