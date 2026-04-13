import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password1!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@clubscentra.test' },
    create: {
      username: 'demo',
      email: 'demo@clubscentra.test',
      passwordHash,
      displayName: 'Demo Driver',
      bio: 'Seed account for local development',
      settings: { create: {} },
    },
    update: {},
  });

  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const existingEvents = await prisma.event.count({ where: { hostId: user.id } });
  if (existingEvents === 0) {
    await prisma.event.createMany({
      data: [
        {
          hostId: user.id,
          title: 'Downtown Drive',
          description: 'Seed event — popular meet downtown.',
          imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
          startAt: future,
          endAt: new Date(future.getTime() + 5 * 60 * 60 * 1000),
          city: 'Toronto',
          region: 'ON',
          country: 'CA',
          addressLine: '123 Queen St W',
          latitude: 43.6532,
          longitude: -79.3832,
        },
        {
          hostId: user.id,
          title: 'Past Cruise',
          description: 'Already happened — shows in ride log.',
          imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
          startAt: past,
          endAt: new Date(past.getTime() + 3 * 60 * 60 * 1000),
          city: 'Mississauga',
          region: 'ON',
          country: 'CA',
          latitude: 43.589,
          longitude: -79.6441,
        },
      ],
    });
  }

  console.log('Seed OK — demo login: demo@clubscentra.test / Password1!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
