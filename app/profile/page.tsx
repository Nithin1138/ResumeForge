import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile | ATSLift",
  description: "Manage your ATSLift candidate account, update personal details, and check your resume activity.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      resumes: {
        select: {
          id: true,
          paymentStatus: true,
        },
      },
      coverLetters: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?error=SessionExpired");
  }

  const resumesCount = user.resumes.length;
  const paidResumesCount = user.resumes.filter((r) => r.paymentStatus === "PAID").length;
  const coverLettersCount = user.coverLetters.length;

  const initialUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    referralCode: user.referralCode,
    resumesCount,
    paidResumesCount,
    coverLettersCount,
    hasPasswordAccount: Boolean(user.password),
  };

  return <ProfileClient initialUser={initialUser} />;
}
