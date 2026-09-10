import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const dict = await getDictionary();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">{dict.common.pageNotFound}</h2>
      <p className="text-muted-foreground">{dict.common.pageNotFoundDesc}</p>
      <Link href="/" className="rounded bg-foreground px-4 py-2 text-sm text-background hover:bg-muted-foreground">
        {dict.common.goHome}
      </Link>
    </div>
  );
}
