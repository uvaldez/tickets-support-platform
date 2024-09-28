// seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const users = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
