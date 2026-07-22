import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateEventParticipants() {
  console.log('Starting migration: Mapping existing events to participants...');

  try {
    // Get all events that have a createdBy field
    const events = await prisma.calendarEvent.findMany({
      where: {
        createdBy: {
          not: null,
        },
        deletedAt: null,
      },
    });

    console.log(`Found ${events.length} events to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      if (!event.createdBy) continue;

      // Check if the creator is already a participant
      const existingParticipant = await prisma.calendarEventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId: event.createdBy,
          },
        },
      });

      if (existingParticipant) {
        skippedCount++;
        continue;
      }

      // Add the creator as a participant
      await prisma.calendarEventParticipant.create({
        data: {
          eventId: event.id,
          userId: event.createdBy,
          status: 'ACCEPTED',
          responseAt: new Date(),
        },
      });

      migratedCount++;
      console.log(`Migrated event ${event.id}: Added creator ${event.createdBy} as participant`);
    }

    console.log('\nMigration completed!');
    console.log(`Total events processed: ${events.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped (already had creator as participant): ${skippedCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateEventParticipants()
  .then(() => {
    console.log('Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
