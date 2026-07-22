import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTokenRoles() {
  console.log('Checking if roles are included in JWT validation...');

  try {
    // Find Yaşar Acar user
    const user = await prisma.user.findFirst({
      where: {
        firstName: 'Yaşar',
        lastName: 'Acar',
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      console.log('Yaşar Acar user not found');
      return;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Roles from database: ${user.roles.map(ur => ur.role.name).join(', ')}`);

    // Simulate what JwtStrategy.validate returns
    const roleNames = user.roles.map(ur => ur.role.name);
    const userWithRole = {
      ...user,
      role: roleNames[0] || null,
      roles: roleNames,
    };

    console.log(`\nWhat JwtStrategy would return:`);
    console.log(`  role: ${userWithRole.role}`);
    console.log(`  roles: ${userWithRole.roles ? userWithRole.roles.join(', ') : 'undefined'}`);

    // Check if LAWYER role is in the array
    const isLawyer = userWithRole.roles?.includes('LAWYER');
    const isAdmin = userWithRole.roles?.includes('ADMIN');
    const isPartner = userWithRole.roles?.includes('MANAGING_PARTNER');

    console.log(`\nRole checks:`);
    console.log(`  Is LAWYER: ${isLawyer}`);
    console.log(`  Is ADMIN: ${isAdmin}`);
    console.log(`  Is MANAGING_PARTNER: ${isPartner}`);
    console.log(`  Is Admin or Partner: ${isAdmin || isPartner}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokenRoles()
  .then(() => {
    console.log('Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
