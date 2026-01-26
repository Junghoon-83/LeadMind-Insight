import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { questions as staticQuestions } from '@/data/questions';
import { logger, logApiError } from '@/lib/logger';

// GET - Fetch active questions for diagnosis
export async function GET() {
  try {
    // Try database first
    if (process.env.DATABASE_URL) {
      try {
        const dbQuestions = await prisma.question.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            code: true,
            text: true,
            category: true,
            subcategory: true,
          },
        });

        if (dbQuestions.length > 0) {
          // Convert to app format (extract number from code Q01 -> 1)
          const questions = dbQuestions.map((q) => ({
            id: parseInt(q.code.replace('Q', ''), 10),
            text: q.text,
            category: q.category,
            subcategory: q.subcategory,
          }));
          return NextResponse.json({ questions, total: questions.length });
        }
      } catch (e) {
        logger.warn('DB query failed, falling back to static data', {
          table: 'question',
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }

    // Fallback to static data
    return NextResponse.json({
      questions: staticQuestions,
      total: staticQuestions.length,
    });
  } catch (error) {
    logApiError('GET', '/api/questions', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
