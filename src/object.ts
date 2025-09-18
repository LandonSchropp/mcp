/**
 * Maps the values of an object using a transformation function.
 *
 * @param object - The object whose values are to be transformed.
 * @param transform - A function that takes a value and its key, and returns the transformed value.
 * @returns A new object with the same keys but transformed values.
 */
export function mapValues<T, R>(
  object: Record<string, T>,
  transform: (value: T, key: string) => R,
): Record<string, R> {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, transform(value, key)]),
  );
}
