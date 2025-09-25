import "vitest";

interface CustomMatchers<R = unknown> {
  toHaveSameMembers: (expected: unknown) => R;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> { }
}
