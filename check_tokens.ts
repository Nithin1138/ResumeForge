import { prisma } from "./lib/prisma";

async function main() {
  const tokens = await prisma.verificationToken.findMany();
  console.log("Tokens in DB:", tokens);
  
  const users = await prisma.user.findMany({ select: { email: true, emailVerified: true } });
  console.log("Users in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
