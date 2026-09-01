export type IsbnLookupResult = {
  isbn: string;
  title: string;
  author?: string;
  coverUrl?: string;
};

/** Looks up a single ISBN via the Open Library API. Returns null if not found. */
export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult | null> {
  const { fetchBook } = await import("./books/openlibrary");
  const cleaned = isbn.replace(/[^0-9Xx]/g, "");
  const book = await fetchBook(cleaned);
  if (!book) return null;
  return {
    isbn: cleaned,
    title: book.title,
    author: book.authors,
    coverUrl: book.coverUrl,
  };
}

/** Looks up many ISBNs (bulk import) with throttle & abort on 3 consecutive failures. */
export async function lookupIsbns(isbns: string[]): Promise<IsbnLookupResult[]> {
  const { fetchBooksWithThrottle } = await import("./books/openlibrary");
  // For simple text import, use throttled version to avoid hammering OL
  if (isbns.length > 5) {
    const books = await fetchBooksWithThrottle(isbns);
    return books.map((b, i) => ({ isbn: isbns[i].replace(/[^0-9Xx]/g, ""), title: b.title, author: b.authors, coverUrl: b.coverUrl })).filter((r) => !!r.title);
  }
  const results = await Promise.all(isbns.map((isbn) => lookupIsbn(isbn).catch(() => null)));
  return results.filter((r): r is IsbnLookupResult => r !== null);
}
