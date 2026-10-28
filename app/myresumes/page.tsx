import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyResumesClient from "./MyResumesClient";

export const dynamic = "force-dynamic";

export default async function MyResumesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      resumes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          resumeName: true,
          targetRole: true,
          branch: true,
          cgpa: true,
          college: true,
          createdAt: true,
          paymentStatus: true,
          categoryTag: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?error=SessionExpired");
  }

  const formattedResumes = user.resumes.map((r) => ({
    id: r.id,
    resumeName: r.resumeName,
    targetRole: r.targetRole,
    branch: r.branch,
    cgpa: r.cgpa,
    college: r.college,
    createdAt: r.createdAt.toISOString(),
    paymentStatus: r.paymentStatus,
    inputData: "",
    categoryTag: r.categoryTag || "blue",
  }));

  return <MyResumesClient initialResumes={formattedResumes} />;
}
