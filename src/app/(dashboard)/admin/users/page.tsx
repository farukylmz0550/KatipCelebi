import { requireAdmin } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUsers } from "@/app/actions/admin";
import { UserTable } from "./user-table";

export default async function AdminUsersPage() {
  await requireAdmin();
  const dict = await getDictionary();
  const users = await getUsers();

  const pending = users.filter((u) => !u.approved);
  const approved = users.filter((u) => u.approved);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.admin.usersTitle}</h1>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">
            {dict.admin.pendingApproval} ({pending.length})
          </h2>
          <UserTable users={pending} dict={{ ...dict.common, ...dict.admin, ...dict.filter }} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          {dict.admin.approvedUsers} ({approved.length})
        </h2>
        <UserTable users={approved} dict={{ ...dict.common, ...dict.admin, ...dict.filter }} />
      </div>
    </div>
  );
}
