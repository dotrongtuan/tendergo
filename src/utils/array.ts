export function shuffleArray<T>(items: readonly T[]): T[] {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex]!, clone[index]!];
  }

  return clone;
}

export function sampleWithoutReplacement<T>(items: readonly T[], count: number): T[] {
  return shuffleArray(items).slice(0, Math.max(0, count));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function unique<T>(items: readonly T[]) {
  return [...new Set(items)];
}
