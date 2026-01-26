/**
 * 비밀번호 해시 생성 스크립트
 *
 * 사용법:
 *   npx ts-node scripts/hash-password.ts <비밀번호>
 *
 * 또는:
 *   npm run hash-password <비밀번호>
 *
 * 출력된 해시값을 ADMIN_PASSWORD_HASH 환경변수로 설정하세요.
 */

import bcrypt from 'bcryptjs';

async function hashPassword() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npx ts-node scripts/hash-password.ts <password>');
    console.error('Example: npx ts-node scripts/hash-password.ts MySecurePassword123!');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);

  console.log('\n✅ Password hash generated successfully!\n');
  console.log('Add this to your .env file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('\n⚠️  Keep this hash secure and never commit it to version control.\n');
}

hashPassword().catch(console.error);
