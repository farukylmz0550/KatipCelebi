import { requireAdmin } from "@/lib/session";
import { getCoverStats, clearCoverCache } from "@/app/actions/covers";

export default async function AdminCoversPage() {
  await requireAdmin();
  const { count, totalUrlBytes } = await getCoverStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cover Cache (Admin)</h1>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Cached covers: {count}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">URL metadata: {totalUrlBytes} bytes</p>
        <form
          action={async () => {
            "use server";
            await clearCoverCache();
          }}
        >
          <button type="submit" className="mt-3 rounded bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900">
            Clear them
          </button>
        </form>
      </div>
      <p className="text-xs text-neutral-500">Cleared covers will be re-fetched when needed.</p>
    </div>
  );
}
