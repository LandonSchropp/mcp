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

export async function filterAsync<T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T[]> {
  let result: T[] = [];

  (await Promise.all(array.map(predicate))).forEach((include, index) => {
    if (include) {
      result.push(array[index]);
    }
  });

  return result;
}
