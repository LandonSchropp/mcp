/**
 * Maps the values of an object using a transformation function.
 *
 * @param object - The object whose values are to be transformed.
 * @param transform - A function that takes a value and its key, and returns the transformed value.
 * @returns A new object with the same keys but transformed values.
 */
export async function mapValuesAsync<T, R>(
  object: Record<string, T>,
  transform: (value: T, key: string) => Promise<R>,
): Promise<Record<string, R>> {
  let entries = Object.entries(object);

  let transformedEntries = await Promise.all(
    entries.map(async ([key, value]) => [key, await transform(value, key)] as const),
  );

  return Object.fromEntries(transformedEntries);
}
