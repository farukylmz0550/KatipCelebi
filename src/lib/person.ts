// Person helpers — legacy src/people/model.py port.
// Single responsibility: person normalization & trust.

export function normalizeName(name: string): string {
  return name.split(/\s+/).join(" ").trim().toLowerCase();
}

export function displayName(name: string): string {
  return name.trim();
}

export function trustScore(returned: number, out: number): number {
  return returned - out;
}

export function canRemovePerson(outCount: number): boolean {
  return outCount === 0;
}
