import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import EmployeesClient from "@/components/EmployeesClient";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/board");

  return (
    <EmployeesClient
      user={{ id: user.id, name: user.name ?? user.username, role: user.role }}
    />
  );
}
