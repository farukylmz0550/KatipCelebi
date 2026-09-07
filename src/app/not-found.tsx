import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const dict = await getDictionary();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">{dict.common.pageNotFound}</h2>
      <p className="text-neutral-500 dark:text-neutral-400">{dict.common.pageNotFoundDesc}</p>
      <Link
        href="/"
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {dict.common.goHome}
      </Link>
    </div>
  );
}
