// SPDX-License-Identifier: GPL-3.0-only
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--foreground)]" />
    </div>
  );
}
