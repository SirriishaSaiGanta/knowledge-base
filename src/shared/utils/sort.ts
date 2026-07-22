/** Sorts by an ISO date field, most recent first. Does not mutate the input. */
export function sortByDateDesc<T>(items: T[], dateField: keyof T): T[] {
  return [...items].sort(
    (a, b) => new Date(b[dateField] as string).getTime() - new Date(a[dateField] as string).getTime(),
  );
}
