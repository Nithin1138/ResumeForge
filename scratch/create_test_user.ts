import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "test@example.com";
  const password = "Password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log("User already exists:", existingUser.email);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: "Test User",
      password: hashedPassword,
      emailVerified: new Date(),
    }
  });

  console.log("Test user created successfully:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
