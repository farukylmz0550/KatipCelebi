// Person helpers — legacy src/people/model.py port.
// Single responsibility: person normalization & trust.

export function normalizeName(name: string): string {
  return name.split(/\s+/).join(" ").trim().toLowerCase();
}

export function displayName(name: string): string {
  return name.trim();
}

export function newPersonId(): string {
  // XXXX-XXXX hex, similar to legacy secrets
  const hex = Math.random().toString(16).slice(2, 10).padStart(8, "0").toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export function trustScore(returned: number, out: number): number {
  return returned - out;
}

export function canRemovePerson(outCount: number): boolean {
  return outCount === 0;
}
