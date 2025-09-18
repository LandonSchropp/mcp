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
