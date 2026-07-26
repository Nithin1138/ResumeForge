// scripts/check-user-logs.js
import { prisma } from "../lib/prisma.ts";

async function checkUser() {
  console.log("Checking Telegram Users in Database...");
  const tgUsers = await prisma.telegramUser.findMany({
    include: { user: true }
  });

  console.log(`Found ${tgUsers.length} Telegram users linked:`);
  for (const u of tgUsers) {
    console.log(`----------------------------------------`);
    console.log(`ID: ${u.id}`);
    console.log(`User Email: ${u.user?.email}`);
    console.log(`Inbound Alias: ${u.inboundAlias}`);
    console.log(`Telegram Chat ID: ${u.telegramChatId}`);
    console.log(`Telegram Username: ${u.telegramUsername}`);
  }

  const jobPostings = await prisma.jobPosting.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  console.log(`\nLast 5 JobPostings created:`);
  for (const j of jobPostings) {
    console.log(`- [${j.createdAt.toISOString()}] ${j.companyName} (${j.roleTitle}) - User: ${j.telegramUserId}`);
  }
}

checkUser();
