import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyCoverLettersClient from "./MyCoverLettersClient";

export const dynamic = "force-dynamic";

export default async function MyCoverLettersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      coverLetters: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login?error=SessionExpired");
  }

  const formattedLetters = user.coverLetters.map((l) => ({
    id: l.id,
    companyName: l.companyName,
    targetRole: l.targetRole,
    tone: l.tone,
    candidateName: l.candidateName,
    candidateEmail: l.candidateEmail,
    candidatePhone: l.candidatePhone,
    candidateLocation: l.candidateLocation,
    recipient: l.recipient,
    subject: l.subject,
    salutation: l.salutation,
    openingParagraph: l.openingParagraph,
    bodyParagraph: l.bodyParagraph,
    closingParagraph: l.closingParagraph,
    signOff: l.signOff,
    createdAt: l.createdAt.toISOString(),
    categoryTag: l.categoryTag || "blue",
  }));

  return <MyCoverLettersClient initialLetters={formattedLetters} />;
}
