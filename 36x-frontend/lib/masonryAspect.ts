const COLUMN_PATTERNS: Record<number, string[]> = {
  0: ["aspect-[3/4]", "aspect-[4/5]", "aspect-[3/5]", "aspect-[1/1]"],
  1: ["aspect-[4/5]", "aspect-[3/5]", "aspect-[1/1]", "aspect-[3/4]"],
  2: ["aspect-[3/5]", "aspect-[1/1]", "aspect-[3/4]", "aspect-[4/5]"],
  3: ["aspect-[1/1]", "aspect-[3/4]", "aspect-[4/5]", "aspect-[3/5]"],
};

export function getMasonryAspectClass(globalIdx: number, columns: number): string {
  const col = globalIdx % columns;
  const row = Math.floor(globalIdx / columns);
  const pattern = COLUMN_PATTERNS[col] ?? COLUMN_PATTERNS[0];
  return pattern[row % pattern.length];
}
