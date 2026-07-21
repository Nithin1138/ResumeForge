import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WalletClient from "./WalletClient";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
    include: {
      walletTransactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  let discountPercent = 10;
  try {
    const config = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
    if (config && typeof config.walletDiscountPercent === "number") {
      discountPercent = config.walletDiscountPercent;
    }
  } catch (e) {
    console.warn("Failed to load wallet discount config:", e);
  }

  const formattedTransactions = (user.walletTransactions || []).map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    paidAmount: t.paidAmount,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <WalletClient
      initialBalance={user.walletBalance || 0}
      initialDiscountPercent={discountPercent}
      initialTransactions={formattedTransactions}
    />
  );
}
