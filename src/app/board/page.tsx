import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import Board from "@/components/Board";
import TrafferClient from "@/components/TrafferClient";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const safeUser = {
    id: user.id,
    name: user.name ?? user.username,
    role: user.role,
  };

  // Трафер видит свой личный кабинет (список приведённых лидов + форма),
  // а не канбан-доску.
  if (user.role === "TRAFFER") {
    return <TrafferClient user={safeUser} />;
  }

  return <Board user={safeUser} />;
}
