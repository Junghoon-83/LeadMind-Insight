import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { concerns as staticConcerns } from '@/data/concerns';
import { logger, logApiError } from '@/lib/logger';

// GET - Fetch active concerns
export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const dbConcerns = await prisma.concern.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        });

        if (dbConcerns.length > 0) {
          // Convert to app format (extract number from code C01 -> "1")
          const concerns = dbConcerns.map((c) => ({
            id: String(parseInt(c.code.replace('C', ''), 10)),
            label: c.label,
            categories: c.categories as string[],
            groupName: c.groupName,
          }));
          return NextResponse.json({ concerns });
        }
      } catch (e) {
        logger.warn('DB query failed, falling back to static data', {
          table: 'concern',
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }

    return NextResponse.json({ concerns: staticConcerns });
  } catch (error) {
    logApiError('GET', '/api/concerns', error);
    return NextResponse.json({ error: 'Failed to fetch concerns' }, { status: 500 });
  }
}
