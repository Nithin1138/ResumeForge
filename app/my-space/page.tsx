import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MySpaceClient from "./MySpaceClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Space | ATSLift Candidate Vault",
  description: "Manage your master profile details, academic records, engineering projects, and generate instant tailored AI application answers.",
};

export default async function MySpacePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return <MySpaceClient userEmail={session.user.email} />;
}
