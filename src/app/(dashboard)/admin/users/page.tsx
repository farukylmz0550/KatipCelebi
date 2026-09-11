import { requireAdminPage } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { getUsers } from "@/app/actions/admin";
import { UserTable } from "./user-table";

export default async function AdminUsersPage() {
  await requireAdminPage();
  const dict = await getDictionary();
  const users = await getUsers();

  const pending = users.filter((u) => !u.approved);
  const approved = users.filter((u) => u.approved);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-foreground">
          {dict.admin.usersTitle}
        </h1>
        <p className="font-[var(--font-sans)] text-sm text-muted-foreground">
          {users.length} {dict.common.books}
        </p>
      </header>

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
