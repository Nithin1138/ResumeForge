import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.verificationToken.findMany();
  console.log("Tokens in DB:", tokens);
}
main().catch(console.error).finally(() => prisma.$disconnect());
