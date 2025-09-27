import { identity } from "../../src/utilities/function";
import { describe, it, expect } from "vitest";

describe("identity", () => {
  describe("when given a string", () => {
    it("returns the same string", () => {
      expect(identity("hello")).toBe("hello");
    });
  });

  describe("when given a number", () => {
    it("returns the same number", () => {
      expect(identity(42)).toBe(42);
    });
  });

  describe("when given a boolean", () => {
    it("returns the same boolean", () => {
      expect(identity(true)).toBe(true);
      expect(identity(false)).toBe(false);
    });
  });

  describe("when given null", () => {
    it("returns null", () => {
      expect(identity(null)).toBe(null);
    });
  });

  describe("when given undefined", () => {
    it("returns undefined", () => {
      expect(identity(undefined)).toBe(undefined);
    });
  });

  describe("when given an array", () => {
    it("returns the same array reference", () => {
      const arr = [1, 2, 3];
      expect(identity(arr)).toBe(arr);
    });
  });

  describe("when given an object", () => {
    it("returns the same object reference", () => {
      const obj = { name: "test", value: 123 };
      expect(identity(obj)).toBe(obj);
    });
  });

  describe("when given an empty string", () => {
    it("returns empty string", () => {
      expect(identity("")).toBe("");
    });
  });

  describe("when given zero", () => {
    it("returns zero", () => {
      expect(identity(0)).toBe(0);
    });
  });

  describe("when given a function", () => {
    it("returns the same function reference", () => {
      const fn = () => "test";
      expect(identity(fn)).toBe(fn);
    });
  });

  describe("when given a symbol", () => {
    it("returns the same symbol", () => {
      const sym = Symbol("test");
      expect(identity(sym)).toBe(sym);
    });
  });

  describe("when given nested data structures", () => {
    it("returns the same reference for complex objects", () => {
      const complex = {
        array: [1, 2, { nested: true }],
        func: () => "hello",
        map: new Map([["key", "value"]]),
      };
      expect(identity(complex)).toBe(complex);
    });
  });
});
