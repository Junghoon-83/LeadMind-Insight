import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { leadershipTypes as staticLeadershipTypes } from '@/data/leadershipTypes';
import { logger, logApiError } from '@/lib/logger';

// GET - Fetch leadership types
export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const dbTypes = await prisma.leadershipType.findMany({
          orderBy: { code: 'asc' },
        });

        if (dbTypes.length > 0) {
          const leadershipTypes: Record<string, unknown> = {};
          dbTypes.forEach((lt) => {
            leadershipTypes[lt.code] = {
              type: lt.code,
              name: lt.name,
              title: lt.title,
              description: lt.description,
              strengths: lt.strengths as string[],
              challenges: lt.challenges as string[],
              image: lt.image,
            };
          });
          return NextResponse.json({ leadershipTypes });
        }
      } catch (e) {
        logger.warn('DB query failed, falling back to static data', {
          table: 'leadershipType',
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }

    return NextResponse.json({ leadershipTypes: staticLeadershipTypes });
  } catch (error) {
    logApiError('GET', '/api/leadership', error);
    return NextResponse.json({ error: 'Failed to fetch leadership types' }, { status: 500 });
  }
}
