import { first, unique, mapToObjectAsync } from "../../src/utilities/array";
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

describe("unique", () => {
  describe("when given an array with duplicates", () => {
    it("returns an array with only unique elements", () => {
      expect(unique([1, 2, 3, 2, 1])).toEqual([1, 2, 3]);
    });

    it("preserves order of first occurrence", () => {
      expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
    });
  });

  describe("when given an array without duplicates", () => {
    it("returns the same array elements", () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("when given an empty array", () => {
    it("returns an empty array", () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe("when given an array with one element", () => {
    it("returns an array with that element", () => {
      expect(unique([42])).toEqual([42]);
    });
  });

  describe("when given an array with string elements", () => {
    it("removes duplicate strings", () => {
      expect(unique(["apple", "banana", "apple", "cherry"])).toEqual(["apple", "banana", "cherry"]);
    });
  });

  describe("when given an array with mixed types", () => {
    it("handles treats different types as unique items", () => {
      const input = [1, "1", 1, "1", true, false, true];
      expect(unique(input)).toEqual([1, "1", true, false]);
    });
  });

  describe("when given an array with objects", () => {
    it("uses reference equality", () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 1 };
      const obj3 = obj1;

      expect(unique([obj1, obj2, obj3])).toEqual([obj1, obj2]);
    });
  });

  describe("when given an array with null and undefined", () => {
    it("treats them as unique values", () => {
      expect(unique([null, undefined, null, undefined])).toEqual([null, undefined]);
    });
  });
});

describe("mapToObjectAsync", () => {
  describe("when given an empty array", () => {
    it("returns an empty object", async () => {
      const result = await mapToObjectAsync([], async (value) => value);
      expect(result).toEqual({});
    });
  });

  describe("when transforming keys to values", () => {
    it("creates the object", async () => {
      const input = ["apple", "banana", "cherry"];
      const result = await mapToObjectAsync(input, async (key) => key.length);
      expect(result).toEqual({ apple: 5, banana: 6, cherry: 6 });
    });
  });

  describe("when keys are duplicated", () => {
    it("overwrites with the last value", async () => {
      const input = ["key", "key", "key"];
      const result = await mapToObjectAsync(input, async (_, index) => index);
      expect(result).toEqual({ key: 2 });
    });
  });
});
