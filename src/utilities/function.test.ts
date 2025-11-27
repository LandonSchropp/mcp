import { identity } from "./function.js";
import { describe, it, expect } from "vitest";

describe("identity", () => {
  it("returns the input value", () => {
    expect(identity("hello")).toBe("hello");
  });
});
