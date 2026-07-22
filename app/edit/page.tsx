import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditClient from "./EditClient";

export const dynamic = "force-dynamic";

export default async function EditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
    include: {
      resumes: {
        where: { abandoned: false },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const formattedSavedResumes = (user.resumes || []).map((r) => ({
    id: r.id,
    resumeName: r.resumeName,
    targetRole: r.targetRole,
    status: r.status,
    paymentStatus: r.paymentStatus,
    createdAt: r.createdAt.toISOString(),
    updatedAt: (r.updatedAt || r.createdAt).toISOString(),
    inputData: r.inputData,
  }));

  return <EditClient savedResumes={formattedSavedResumes} />;
}
