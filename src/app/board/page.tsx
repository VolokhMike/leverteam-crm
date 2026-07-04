import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import Board from "@/components/Board";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <Board user={{ id: user.id, name: user.name ?? user.username, role: user.role }} />
  );
}
