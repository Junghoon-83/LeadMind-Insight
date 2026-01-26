import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { followershipTypes as staticFollowershipTypes, compatibilityData as staticCompatibilityData } from '@/data/followershipTypes';
import { logger, logApiError } from '@/lib/logger';

// GET - Fetch followership types and compatibility data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCompatibility = searchParams.get('includeCompatibility') === 'true';

    let followershipTypes: Record<string, unknown> = staticFollowershipTypes;
    let compatibilityData: Record<string, Record<string, unknown>> = staticCompatibilityData;

    if (process.env.DATABASE_URL) {
      try {
        // Fetch followership types
        const dbTypes = await prisma.followershipType.findMany({
          orderBy: { code: 'asc' },
        });

        if (dbTypes.length > 0) {
          followershipTypes = {};
          dbTypes.forEach((ft) => {
            (followershipTypes as Record<string, unknown>)[ft.code] = {
              type: ft.code,
              name: ft.name,
              title: ft.title,
              description: ft.description,
              icon: ft.icon,
            };
          });
        }

        // Fetch compatibility data if requested
        if (includeCompatibility) {
          const dbCompat = await prisma.compatibility.findMany();
          if (dbCompat.length > 0) {
            compatibilityData = {} as typeof staticCompatibilityData;
            dbCompat.forEach((c) => {
              if (!compatibilityData[c.leaderType]) {
                (compatibilityData as Record<string, Record<string, unknown>>)[c.leaderType] = {};
              }
              (compatibilityData as Record<string, Record<string, unknown>>)[c.leaderType][c.followerType] = {
                leaderType: c.leaderType,
                followerType: c.followerType,
                strengths: c.strengths as string[],
                cautions: c.cautions as string[],
                tips: c.tips as string[],
              };
            });
          }
        }
      } catch (e) {
        logger.warn('DB query failed, falling back to static data', {
          table: 'followershipType',
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }

    const response: Record<string, unknown> = { followershipTypes };
    if (includeCompatibility) {
      response.compatibilityData = compatibilityData;
    }

    return NextResponse.json(response);
  } catch (error) {
    logApiError('GET', '/api/followership', error);
    return NextResponse.json({ error: 'Failed to fetch followership types' }, { status: 500 });
  }
}
