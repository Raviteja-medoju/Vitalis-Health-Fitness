/** Collision-resistant id without a native dependency (sufficient for client-local records). */
export function createId(prefix = ''): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}_${t}${r}` : `${t}${r}`;
}

/** Deterministic 32-bit FNV-1a hash -> [0, 1). Used for stable experiment bucketing. */
export function hashToUnit(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h / 0x100000000;
}
