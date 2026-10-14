import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { AccountDeletionService } from './account-deletion.service';

// A real SQLite database built from prisma/schema.prisma (`prisma db push`), so the test runs the
// actual queries and cascades instead of mocks.
const dir = mkdtempSync(join(tmpdir(), 'lexmind-delete-'));
const url = `file:${join(dir, 'test.db').split('\\').join('/')}`;
let prisma: PrismaClient;
let service: AccountDeletionService;

async function addUser(email: string, roleNames: string[] = ['LAWYER'], extra: Record<string, unknown> = {}) {
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash('Sifre1234!x', 4),
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      phoneNumber: '0500',
      aiApiKey: 'encrypted-key',
      ...extra,
    },
  });
  for (const name of roleNames) {
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }
  return user;
}

beforeAll(() => {
  execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push', '--skip-generate'], {
    cwd: join(__dirname, '../../../..'),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'ignore',
  });
  prisma = new PrismaClient({ adapter: new PrismaLibSQL(createClient({ url })) } as any);
  service = new AccountDeletionService(prisma as any);
}, 120000);

afterAll(async () => {
  await prisma.$disconnect();
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // Windows may keep the file locked briefly; the OS temp folder cleans it up.
  }
});

describe('AccountDeletionService.deleteOwnAccount', () => {
  it('rejects a wrong password and leaves the account untouched', async () => {
    const u = await addUser('wrong@test.com');
    await expect(service.deleteOwnAccount(u.id, 'yanlis')).rejects.toBeInstanceOf(BadRequestException);
    expect(await prisma.user.findUnique({ where: { id: u.id } })).not.toBeNull();
  });

  it('returns NotFound for an unknown user and for an already deleted one', async () => {
    await expect(service.deleteOwnAccount('nope', 'x')).rejects.toBeInstanceOf(NotFoundException);
    const u = await addUser('twice@test.com');
    await service.deleteOwnAccount(u.id, 'Sifre1234!x');
    await expect(service.deleteOwnAccount(u.id, 'Sifre1234!x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses demo accounts', async () => {
    const u = await addUser('demo@test.com', ['LAWYER'], { isDemo: true });
    await expect(service.deleteOwnAccount(u.id, 'Sifre1234!x')).rejects.toBeInstanceOf(ForbiddenException);
    expect(await prisma.user.findUnique({ where: { id: u.id } })).not.toBeNull();
  });

  it('removes the user and all personal AI data, keeps audit rows without IP and user agent', async () => {
    const u = await addUser('uye@test.com');
    const other = await addUser('baska@test.com');
    const convo = await prisma.aIConversation.create({ data: { title: 'Müvekkil X dosyası', userId: u.id, model: 'm', status: 'active' } });
    await prisma.aIMessage.create({ data: { conversationId: convo.id, role: 'user', content: 'müvekkil bilgisi' } });
    await prisma.aIMemory.create({ data: { userId: u.id, key: 'k', value: 'v' } });
    await prisma.aIUsageLog.create({ data: { userId: u.id, model: 'm', inputTokens: 1, outputTokens: 1, totalTokens: 2, responseTime: 5 } });
    await prisma.aIRecommendation.create({
      data: { userId: u.id, type: 't', priority: 'high', title: 'x', description: 'd', reason: 'r', confidenceScore: 80 },
    });
    await prisma.aIDailyPlan.create({ data: { userId: u.id, date: new Date('2026-10-14') } });
    await prisma.refreshToken.create({ data: { token: 'rt-1', userId: u.id, expiresAt: new Date(Date.now() + 1e6) } });
    await prisma.loginHistory.create({ data: { userId: u.id, ipAddress: '1.2.3.4', userAgent: 'UA' } });
    await prisma.auditLog.create({ data: { userId: u.id, action: 'LOGIN', entity: 'User', entityId: u.id, ipAddress: '1.2.3.4', userAgent: 'UA' } });
    await prisma.aIMemory.create({ data: { userId: other.id, key: 'k', value: 'other' } });

    await service.deleteOwnAccount(u.id, 'Sifre1234!x');

    expect(await prisma.user.findUnique({ where: { id: u.id } })).toBeNull();
    expect(await prisma.aIConversation.count({ where: { userId: u.id } })).toBe(0);
    expect(await prisma.aIMessage.count({ where: { conversationId: convo.id } })).toBe(0);
    expect(await prisma.aIMemory.count({ where: { userId: u.id } })).toBe(0);
    expect(await prisma.aIUsageLog.count({ where: { userId: u.id } })).toBe(0);
    expect(await prisma.aIRecommendation.count({ where: { userId: u.id } })).toBe(0);
    expect(await prisma.aIDailyPlan.count({ where: { userId: u.id } })).toBe(0);
    expect(await prisma.refreshToken.count({ where: { userId: u.id } })).toBe(0);
    expect(await prisma.loginHistory.count({ where: { userId: u.id } })).toBe(0);

    const audit = await prisma.auditLog.findMany({ where: { userId: u.id } });
    expect(audit).toHaveLength(1);
    expect(audit[0].ipAddress).toBeNull();
    expect(audit[0].userAgent).toBeNull();

    expect(await prisma.aIMemory.count({ where: { userId: other.id } })).toBe(1);
  });

  it('refuses to delete the last admin (ADMIN or MANAGING_PARTNER) and allows it when another exists', async () => {
    const only = await addUser('only-admin@test.com', ['ADMIN']);
    await expect(service.deleteOwnAccount(only.id, 'Sifre1234!x')).rejects.toBeInstanceOf(ConflictException);
    expect(await prisma.user.findUnique({ where: { id: only.id } })).not.toBeNull();

    await addUser('partner@test.com', ['MANAGING_PARTNER']);
    await expect(service.deleteOwnAccount(only.id, 'Sifre1234!x')).resolves.toBeUndefined();
  });
});
