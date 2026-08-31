export type IsbnLookupResult = {
  isbn: string;
  title: string;
  author?: string;
  coverUrl?: string;
};

/** Looks up a single ISBN via the Open Library API. Returns null if not found. */
export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult | null> {
  const cleaned = isbn.replace(/[^0-9Xx]/g, "");
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleaned}&format=json&jscmd=data`);
  if (!res.ok) return null;

  const data = await res.json();
  const entry = data[`ISBN:${cleaned}`];
  if (!entry) return null;

  return {
    isbn: cleaned,
    title: entry.title ?? cleaned,
    author: entry.authors?.map((a: { name: string }) => a.name).join(", "),
    coverUrl: entry.cover?.medium ?? entry.cover?.large,
  };
}

/** Looks up many ISBNs (bulk import), skipping any that fail. */
export async function lookupIsbns(isbns: string[]): Promise<IsbnLookupResult[]> {
  const results = await Promise.all(isbns.map((isbn) => lookupIsbn(isbn).catch(() => null)));
  return results.filter((r): r is IsbnLookupResult => r !== null);
}
