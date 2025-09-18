import { first } from "../src/array";
import { describe, it, expect } from "bun:test";

describe("first", () => {
  describe("when given an array", () => {
    it("returns the first element", () => {
      expect(first([1, 2, 3])).toBe(1);
    });
  });

  describe("when given an array with one element", () => {
    it("returns that element", () => {
      expect(first([42])).toBe(42);
    });
  });

  describe("when given an empty array", () => {
    it("throws an error", () => {
      expect(() => first([])).toThrow();
    });
  });

  describe("when given a single element", () => {
    it("returns the element for numbers", () => {
      expect(first(42)).toBe(42);
    });
  });

  describe("when given nested arrays", () => {
    it("returns the first nested array", () => {
      const nested = [
        [1, 2],
        [3, 4],
      ];
      expect(first(nested)).toEqual([1, 2]);
    });
  });
});
