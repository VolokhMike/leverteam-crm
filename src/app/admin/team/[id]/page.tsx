import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import TeamMemberProfile from "@/components/TeamMemberProfile";

export const dynamic = "force-dynamic";

export default async function TeamMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/board");

  return (
    <TeamMemberProfile
      user={{ id: user.id, name: user.name ?? user.username, role: user.role }}
      memberId={params.id}
    />
  );
}
