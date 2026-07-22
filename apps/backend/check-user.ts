import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'acar', mode: 'insensitive' } },
          { firstName: { contains: 'Yaşar', mode: 'insensitive' } },
          { lastName: { contains: 'Acar', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        aiProvider: true,
        aiApiKey: true,
        aiModel: true,
        aiSettings: true,
        createdAt: true,
      },
    });

    console.log('Found users:');
    users.forEach(user => {
      console.log(`\nUser: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`AI Provider: ${user.aiProvider}`);
      console.log(`AI Model: ${user.aiModel}`);
      console.log(`Has API Key: ${user.aiApiKey ? 'Yes' : 'No'}`);
      console.log(`API Key Length: ${user.aiApiKey?.length || 0}`);
      console.log(`API Key Preview: ${user.aiApiKey?.substring(0, 20)}...`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
