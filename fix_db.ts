import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.adminConfig.update({
    where: { id: "admin" },
    data: {
      bannerText: "🔥 Placement Season: Use our ATS-friendly templates to get noticed.",
      ctaText: "Build Resume Free"
    }
  }).catch(e => console.log("Update failed, might not exist yet:", e.message));
  console.log("DB updated");
}

main().finally(() => prisma.$disconnect());
