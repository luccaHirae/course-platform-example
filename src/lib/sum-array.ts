export function sumArray<T>(array: T[], fn: (item: T) => number) {
  return array.reduce((acc, item) => acc + fn(item), 0);
}
