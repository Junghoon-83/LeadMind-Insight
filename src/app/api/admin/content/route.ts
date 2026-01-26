import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  ContentCreateSchema,
  ContentUpdateSchema,
  ContentQuerySchema,
  ContentDeleteSchema,
  formatZodError,
  getZodErrorDetails,
} from '@/lib/validations';
import { logger, logApiError } from '@/lib/logger';

// Static data imports for fallback
import { questions } from '@/data/questions';
import { leadershipTypes } from '@/data/leadershipTypes';
import { concerns } from '@/data/concerns';
import { solutions } from '@/data/solutions';
import { followershipTypes, compatibilityData } from '@/data/followershipTypes';

// Followership code mapping
const followershipCodeMap: Record<string, string> = {
  'Driver': 'F01',
  'Thinker': 'F02',
  'Supporter': 'F03',
  'Doer': 'F04',
  'Follower': 'F05',
};

// Convert static data to admin format
function getStaticData(type: string): Record<string, unknown>[] {
  switch (type) {
    case 'questions':
      return questions.map((q, idx) => ({
        id: idx + 1,
        code: `Q${String(q.id).padStart(2, '0')}`,
        text: q.text,
        category: q.category,
        subcategory: q.subcategory || null,
        sortOrder: idx + 1,
        isActive: true,
      }));

    case 'leadership':
      return Object.values(leadershipTypes).map((lt, idx) => ({
        id: idx + 1,
        code: lt.type,
        name: lt.name,
        title: lt.title,
        description: lt.description,
        strengths: lt.strengths,
        challenges: lt.challenges,
        image: lt.image || null,
        sortOrder: idx + 1,
        isActive: true,
      }));

    case 'concerns':
      return concerns.map((c, idx) => ({
        id: idx + 1,
        code: `C${String(c.id).padStart(2, '0')}`,
        label: c.label,
        categories: c.categories,
        groupName: c.groupName || '',
        sortOrder: idx + 1,
        isActive: true,
      }));

    case 'solutions':
      return Object.values(solutions).map((s, idx) => ({
        id: idx + 1,
        code: s.id,
        combination: s.combination,
        title: s.title,
        coreIssue: s.coreIssue,
        fieldVoices: s.fieldVoices,
        diagnosis: s.diagnosis,
        sortOrder: idx + 1,
        isActive: true,
      }));

    case 'actions':
      const allActions: Record<string, unknown>[] = [];
      let actionId = 1;
      Object.values(solutions).forEach((s) => {
        s.actions.forEach((a, idx) => {
          allActions.push({
            id: actionId++,
            solutionId: s.id,
            solutionCode: s.id,
            combination: s.combination,
            sortOrder: idx + 1,
            title: a.title,
            method: a.method,
            effect: a.effect,
            leadershipTip: a.leadershipTip,
          });
        });
      });
      allActions.sort((a, b) => {
        const codeCompare = String(a.solutionCode).localeCompare(String(b.solutionCode));
        if (codeCompare !== 0) return codeCompare;
        return (a.sortOrder as number) - (b.sortOrder as number);
      });
      return allActions;

    case 'followership':
      return Object.values(followershipTypes).map((ft, idx) => ({
        id: idx + 1,
        code: followershipCodeMap[ft.type] || `F${String(idx + 1).padStart(2, '0')}`,
        name: ft.name,
        title: ft.title,
        description: ft.description,
        icon: ft.icon,
        sortOrder: idx + 1,
        isActive: true,
      }));

    case 'compatibility':
      const flatCompatibility: Record<string, unknown>[] = [];
      let compatId = 1;
      Object.values(compatibilityData).forEach((leaderCompat) => {
        Object.values(leaderCompat).forEach((c) => {
          flatCompatibility.push({
            id: compatId++,
            leaderType: c.leaderType,
            followerType: followershipCodeMap[c.followerType] || c.followerType,
            strengths: c.strengths,
            cautions: c.cautions,
            tips: c.tips,
          });
        });
      });
      return flatCompatibility;

    default:
      return [];
  }
}

// Check if database is configured
async function isDatabaseConfigured(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// GET - Fetch all content of a specific type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // 입력 검증
    const queryValidation = ContentQuerySchema.safeParse({ type });
    if (!queryValidation.success) {
      return NextResponse.json(
        { error: formatZodError(queryValidation.error), details: getZodErrorDetails(queryValidation.error) },
        { status: 400 }
      );
    }

    const validatedType = queryValidation.data.type;
    const dbConfigured = await isDatabaseConfigured();

    // Try database first
    if (dbConfigured) {
      try {
        let data;
        switch (validatedType) {
          case 'leadership':
            data = await prisma.leadershipType.findMany({ orderBy: { code: 'asc' } });
            break;
          case 'followership':
            data = await prisma.followershipType.findMany({ orderBy: { code: 'asc' } });
            break;
          case 'compatibility':
            data = await prisma.compatibility.findMany({ orderBy: [{ leaderType: 'asc' }, { followerType: 'asc' }] });
            break;
          case 'questions':
            data = await prisma.question.findMany({ orderBy: { sortOrder: 'asc' } });
            break;
          case 'concerns':
            data = await prisma.concern.findMany({ orderBy: { sortOrder: 'asc' } });
            break;
          case 'solutions':
            data = await prisma.solution.findMany({ orderBy: { sortOrder: 'asc' }, include: { actions: { orderBy: { sortOrder: 'asc' } } } });
            break;
          case 'actions':
            const actions = await prisma.solutionAction.findMany({
              include: { solution: { select: { code: true, combination: true } } },
            });
            data = actions
              .map((a) => ({
                ...a,
                solutionCode: a.solution?.code || '',
                combination: a.solution?.combination || '',
              }))
              .sort((x, y) => {
                const codeCompare = x.solutionCode.localeCompare(y.solutionCode);
                if (codeCompare !== 0) return codeCompare;
                return x.sortOrder - y.sortOrder;
              });
            break;
          default:
            data = null;
        }
        if (data !== null) {
          return NextResponse.json({ data, isStatic: false });
        }
      } catch (e) {
        logger.warn('Admin DB query failed, falling back to static data', {
          type: validatedType,
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }

    // Fallback to static data
    const staticData = getStaticData(validatedType);
    return NextResponse.json({ data: staticData, isStatic: true });
  } catch (error) {
    logApiError('GET', '/api/admin/content', error);
    return NextResponse.json({ error: '데이터를 가져오는 데 실패했습니다.' }, { status: 500 });
  }
}

// POST - Create new content
export async function POST(request: Request) {
  if (!(await isDatabaseConfigured())) {
    return NextResponse.json(
      { error: 'Database가 설정되지 않았습니다. 현재는 정적 데이터만 지원됩니다.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // 입력 검증
    const validation = ContentCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: '입력 데이터가 유효하지 않습니다.',
          message: formatZodError(validation.error),
          details: getZodErrorDetails(validation.error),
        },
        { status: 400 }
      );
    }

    const { type, data } = validation.data;
    let result;

    switch (type) {
      case 'leadership':
        result = await prisma.leadershipType.create({ data });
        break;
      case 'followership':
        result = await prisma.followershipType.create({ data });
        break;
      case 'compatibility':
        result = await prisma.compatibility.create({ data });
        break;
      case 'questions':
        result = await prisma.question.create({ data });
        break;
      case 'concerns':
        result = await prisma.concern.create({ data });
        break;
      case 'solutions':
        result = await prisma.solution.create({ data });
        break;
      case 'actions':
        result = await prisma.solutionAction.create({ data });
        break;
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    logApiError('POST', '/api/admin/content', error);

    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '이미 존재하는 코드입니다. 다른 코드를 사용해주세요.' },
          { status: 409 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: '참조하는 데이터가 존재하지 않습니다.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: '데이터를 생성하는 데 실패했습니다.' }, { status: 500 });
  }
}

// PUT - Update content
export async function PUT(request: Request) {
  if (!(await isDatabaseConfigured())) {
    return NextResponse.json(
      { error: 'Database가 설정되지 않았습니다. 현재는 정적 데이터만 지원됩니다.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // 입력 검증
    const validation = ContentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: '입력 데이터가 유효하지 않습니다.',
          message: formatZodError(validation.error),
          details: getZodErrorDetails(validation.error),
        },
        { status: 400 }
      );
    }

    const { type, id, data } = validation.data;
    let result;

    switch (type) {
      case 'leadership':
        result = await prisma.leadershipType.update({ where: { id }, data });
        break;
      case 'followership':
        result = await prisma.followershipType.update({ where: { id }, data });
        break;
      case 'compatibility':
        result = await prisma.compatibility.update({ where: { id }, data });
        break;
      case 'questions':
        result = await prisma.question.update({ where: { id }, data });
        break;
      case 'concerns':
        result = await prisma.concern.update({ where: { id }, data });
        break;
      case 'solutions':
        result = await prisma.solution.update({ where: { id }, data });
        break;
      case 'actions':
        result = await prisma.solutionAction.update({ where: { id }, data });
        break;
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    logApiError('PUT', '/api/admin/content', error);

    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: '수정하려는 데이터를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '이미 존재하는 코드입니다. 다른 코드를 사용해주세요.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ error: '데이터를 수정하는 데 실패했습니다.' }, { status: 500 });
  }
}

// DELETE - Delete content
export async function DELETE(request: Request) {
  if (!(await isDatabaseConfigured())) {
    return NextResponse.json(
      { error: 'Database가 설정되지 않았습니다. 현재는 정적 데이터만 지원됩니다.' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // 입력 검증
    const validation = ContentDeleteSchema.safeParse({ type, id });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: '입력 데이터가 유효하지 않습니다.',
          message: formatZodError(validation.error),
          details: getZodErrorDetails(validation.error),
        },
        { status: 400 }
      );
    }

    const { type: validatedType, id: validatedId } = validation.data;

    switch (validatedType) {
      case 'leadership':
        await prisma.leadershipType.delete({ where: { id: validatedId } });
        break;
      case 'followership':
        await prisma.followershipType.delete({ where: { id: validatedId } });
        break;
      case 'compatibility':
        await prisma.compatibility.delete({ where: { id: validatedId } });
        break;
      case 'questions':
        await prisma.question.delete({ where: { id: validatedId } });
        break;
      case 'concerns':
        await prisma.concern.delete({ where: { id: validatedId } });
        break;
      case 'solutions':
        await prisma.solution.delete({ where: { id: validatedId } });
        break;
      case 'actions':
        await prisma.solutionAction.delete({ where: { id: validatedId } });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('DELETE', '/api/admin/content', error);

    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: '삭제하려는 데이터를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: '이 데이터를 참조하는 다른 데이터가 있어 삭제할 수 없습니다.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ error: '데이터를 삭제하는 데 실패했습니다.' }, { status: 500 });
  }
}
