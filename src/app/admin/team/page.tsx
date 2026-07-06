import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import TeamClient from "@/components/TeamClient";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/board");

  return (
    <TeamClient
      user={{ id: user.id, name: user.name ?? user.username, role: user.role }}
    />
  );
}
