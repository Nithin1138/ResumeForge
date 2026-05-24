import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const token = "some_random_token";
  const secret = "test_secret";
  const hashedToken = crypto.createHash("sha256").update(token + secret).digest("hex");
  
  await prisma.verificationToken.create({
    data: {
      identifier: "test@example.com",
      token: hashedToken,
      expires: new Date(Date.now() + 100000)
    }
  });

  const found = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: "test@example.com",
        token: hashedToken
      }
    }
  });
  
  console.log("Found:", found);
}
main().catch(console.error).finally(() => prisma.$disconnect());
