import { prisma } from "../lib/prisma";

async function main() {
  const email = "test@example.com";
  const resumeId = "cmpux2mok001q04l1peybn3nw";

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error("Test user not found!");
    return;
  }

  const updatedResume = await prisma.resume.update({
    where: { id: resumeId },
    data: {
      userId: user.id,
      paymentStatus: "PAID"
    }
  });

  console.log("Resume updated successfully:", updatedResume.id, "assigned to user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
