/**
 * Returns the first element of an array or the element itself if it's not an array.
 *
 * @param arrayOrElement An array or a single element()
 * @returns The first element of the array or the element itself
 */
export function first<T>(arrayOrElement: T | T[]): T {
  if (!Array.isArray(arrayOrElement)) {
    return arrayOrElement;
  }

  if (arrayOrElement.length === 0) {
    throw new Error("Array is empty");
  }

  return arrayOrElement[0];
}

/**
 * Returns a new array with only unique elements from the input array.
 *
 * @param array The input array
 * @returns A new array containing only unique elements
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Maps an array to an object using a transformation function that returns a key-value pair.
 *
 * @param array The input array
 * @param transform A function that takes an element of the array and returns a [key, value] tuple
 * @returns An object constructed from the key-value pairs returned by the transform function
 */
export async function mapToObjectAsync<K extends string, V>(
  array: K[],
  transform: (value: K, index: number) => Promise<V>,
): Promise<{ [K in string]: V }> {
  return Object.fromEntries(
    await Promise.all(
      array.map(async (key, index) => {
        return [key, await transform(key, index)];
      }),
    ),
  );
}
