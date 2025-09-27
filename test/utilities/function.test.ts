import { identity } from "../../src/utilities/function";
import { describe, it, expect } from "vitest";

describe("identity", () => {
  it("returns the input value", () => {
    expect(identity("hello")).toBe("hello");
  });
});
