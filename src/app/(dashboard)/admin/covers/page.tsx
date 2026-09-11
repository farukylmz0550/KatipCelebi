import { requireAdminPage } from "@/lib/session";
import { getCoverStats, clearCoverCache } from "@/app/actions/covers";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AdminCoversPage() {
  await requireAdminPage();
  const { count, totalUrlBytes } = await getCoverStats();
  const dict = await getDictionary();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-foreground">
          {dict.admin.coversTitle}
        </h1>
        <p className="font-[var(--font-sans)] text-sm text-muted-foreground">{dict.admin.clearNotice}</p>
      </header>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {dict.admin.cachedCovers} {count}
        </p>
        <p className="text-sm text-muted-foreground">
          {dict.admin.urlMetadata} {totalUrlBytes} {dict.admin.bytes}
        </p>
        <form
          action={async () => {
            "use server";
            await clearCoverCache();
          }}
        >
          <button type="submit" className="mt-3 rounded bg-primary px-4 py-2 text-sm text-primary-foreground">
            {dict.admin.clearThem}
          </button>
        </form>
      </div>
    </div>
  );
}
