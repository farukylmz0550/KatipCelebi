// SPDX-License-Identifier: GPL-3.0-only
"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Generic draft-state helper for editable form fields: holds the local value
 * and exposes a commit() for explicit saves plus setAndSave() for instant
 * saves (toggles, rating stars). The save callback receives the latest value.
 */
export function useEditableField<T>(initial: T, save: (value: T) => void) {
  const [value, setValue] = useState<T>(initial);
  const commit = useCallback(() => save(value), [save, value]);
  const setAndSave = useCallback(
    (v: T) => {
      setValue(v);
      save(v);
    },
    [save],
  );
  return { value, setValue, commit, setAndSave };
}

/**
 * Shared transition wrapper: runs a mutation inside a transition and refreshes
 * the server components afterwards. Returns the shared pending flag.
 */
export function useSaver() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const save = useCallback(
    (fn: () => Promise<unknown>) => {
      startTransition(async () => {
        await fn();
        router.refresh();
      });
    },
    [router],
  );
  return { pending, save };
}
