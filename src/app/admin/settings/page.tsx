import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import AccountSettings from "@/components/AccountSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/board");

  return (
    <AccountSettings
      user={{
        id: user.id,
        name: user.name ?? user.username,
        username: user.username,
        role: user.role,
      }}
    />
  );
}
