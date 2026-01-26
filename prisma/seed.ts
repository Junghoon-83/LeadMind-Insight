import { PrismaClient } from '@prisma/client';
import { leadershipTypes } from '../src/data/leadershipTypes';
import { followershipTypes, compatibilityData } from '../src/data/followershipTypes';
import { questions } from '../src/data/questions';
import { concerns } from '../src/data/concerns';
import { solutions } from '../src/data/solutions';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Leadership Types
  console.log('Seeding leadership types...');
  for (const lt of Object.values(leadershipTypes)) {
    await prisma.leadershipType.upsert({
      where: { code: lt.type },
      update: {
        name: lt.name,
        title: lt.title,
        description: lt.description,
        strengths: lt.strengths,
        challenges: lt.challenges,
        image: lt.image || null,
      },
      create: {
        code: lt.type,
        name: lt.name,
        title: lt.title,
        description: lt.description,
        strengths: lt.strengths,
        challenges: lt.challenges,
        image: lt.image || null,
      },
    });
  }
  console.log(`✓ ${Object.keys(leadershipTypes).length} leadership types seeded`);

  // Seed Followership Types (F01, F02, ...)
  console.log('Seeding followership types...');
  const followershipCodeMap: Record<string, string> = {
    'Driver': 'F01',
    'Thinker': 'F02',
    'Supporter': 'F03',
    'Doer': 'F04',
    'Follower': 'F05',
  };
  for (const ft of Object.values(followershipTypes)) {
    const code = followershipCodeMap[ft.type] || ft.type;
    await prisma.followershipType.upsert({
      where: { code },
      update: {
        name: ft.name,
        title: ft.title,
        description: ft.description,
        icon: ft.icon || null,
      },
      create: {
        code,
        name: ft.name,
        title: ft.title,
        description: ft.description,
        icon: ft.icon || null,
      },
    });
  }
  console.log(`✓ ${Object.keys(followershipTypes).length} followership types seeded`);

  // Seed Compatibility Data (using F01, F02 for followerType)
  console.log('Seeding compatibility data...');
  let compatCount = 0;
  for (const leaderCompat of Object.values(compatibilityData)) {
    for (const c of Object.values(leaderCompat)) {
      const followerCode = followershipCodeMap[c.followerType] || c.followerType;
      await prisma.compatibility.upsert({
        where: {
          leaderType_followerType: {
            leaderType: c.leaderType,
            followerType: followerCode,
          },
        },
        update: {
          strengths: c.strengths,
          cautions: c.cautions,
          tips: c.tips,
        },
        create: {
          leaderType: c.leaderType,
          followerType: followerCode,
          strengths: c.strengths,
          cautions: c.cautions,
          tips: c.tips,
        },
      });
      compatCount++;
    }
  }
  console.log(`✓ ${compatCount} compatibility records seeded`);

  // Seed Questions (Q01, Q02, ...)
  console.log('Seeding questions...');
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const code = `Q${String(q.id).padStart(2, '0')}`; // Q01, Q02, ...
    await prisma.question.upsert({
      where: { code },
      update: {
        text: q.text,
        category: q.category,
        subcategory: q.subcategory || null,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        code,
        text: q.text,
        category: q.category,
        subcategory: q.subcategory || null,
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }
  console.log(`✓ ${questions.length} questions seeded`);

  // Seed Concerns (C01, C02, ...)
  console.log('Seeding concerns...');
  for (let i = 0; i < concerns.length; i++) {
    const c = concerns[i];
    const code = `C${String(c.id).padStart(2, '0')}`; // C01, C02, ...
    await prisma.concern.upsert({
      where: { code },
      update: {
        label: c.label,
        categories: c.categories,
        groupName: c.groupName,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        code,
        label: c.label,
        categories: c.categories,
        groupName: c.groupName,
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }
  console.log(`✓ ${concerns.length} concerns seeded`);

  // Seed Solutions (P01, P02, ...)
  console.log('Seeding solutions...');
  const solutionList = Object.values(solutions);
  for (let i = 0; i < solutionList.length; i++) {
    const s = solutionList[i];

    // Upsert solution
    const solution = await prisma.solution.upsert({
      where: { code: s.id },
      update: {
        combination: s.combination,
        title: s.title,
        coreIssue: s.coreIssue,
        fieldVoices: s.fieldVoices,
        diagnosis: s.diagnosis,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        code: s.id,
        combination: s.combination,
        title: s.title,
        coreIssue: s.coreIssue,
        fieldVoices: s.fieldVoices,
        diagnosis: s.diagnosis,
        sortOrder: i + 1,
        isActive: true,
      },
    });

    // Delete existing actions and recreate
    await prisma.solutionAction.deleteMany({
      where: { solutionId: solution.id },
    });

    // Create actions
    for (let j = 0; j < s.actions.length; j++) {
      const a = s.actions[j];
      await prisma.solutionAction.create({
        data: {
          solutionId: solution.id,
          title: a.title,
          method: a.method,
          effect: a.effect,
          leadershipTip: a.leadershipTip,
          sortOrder: j + 1,
        },
      });
    }
  }
  console.log(`✓ ${solutionList.length} solutions seeded`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
