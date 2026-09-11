export const STATUS_ORDER = ["TO_READ", "READING", "FINISHED"] as const;

export type BookStatus = (typeof STATUS_ORDER)[number];

export interface StatusLabels {
  toRead: string;
  reading: string;
  finished: string;
}

export function getNextStatus(current: string): BookStatus {
  const idx = STATUS_ORDER.indexOf(current as BookStatus);
  if (idx === -1) return STATUS_ORDER[0];
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
}

export function getPrevStatus(current: string): BookStatus {
  const idx = STATUS_ORDER.indexOf(current as BookStatus);
  if (idx === -1) return STATUS_ORDER[STATUS_ORDER.length - 1];
  return STATUS_ORDER[(idx - 1 + STATUS_ORDER.length) % STATUS_ORDER.length];
}

export const STATUS_FALLBACK_LABELS: Record<string, string> = {
  TO_READ: "To Read",
  READING: "Reading",
  FINISHED: "Finished",
};

export function statusLabel(status: string, labels?: StatusLabels): string {
  if (!labels) return STATUS_FALLBACK_LABELS[status] ?? status;
  return status === "TO_READ" ? labels.toRead : status === "READING" ? labels.reading : labels.finished;
}
