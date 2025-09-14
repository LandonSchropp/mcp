/** Represents any valid JSON value. This type recursively defines all possible JSON structures. */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | Array<JSONValue>
  | { [key: string]: JSONValue };
