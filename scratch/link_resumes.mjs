import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  
  const resumes = await prisma.resume.findMany({ where: { userId: null } });
  console.log(`Found ${resumes.length} unlinked resumes`);

  let updated = 0;
  for (const resume of resumes) {
    try {
      const input = JSON.parse(resume.inputData);
      const email = input.personal?.email;
      
      if (email) {
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
          await prisma.resume.update({
            where: { id: resume.id },
            data: { userId: user.id }
          });
          updated++;
        }
      }
    } catch (e) {
      console.error('Error parsing resume', resume.id);
    }
  }
  console.log(`Successfully linked ${updated} resumes`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
