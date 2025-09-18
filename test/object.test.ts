import { mapValuesAsync } from "../src/object";
import { describe, it, expect } from "bun:test";

describe("mapValuesAsync", () => {
  describe("when given an empty object", () => {
    it("returns an empty object", async () => {
      const result = await mapValuesAsync({}, async (value) => value);
      expect(result).toEqual({});
    });
  });

  describe("when transforming values", () => {
    it("applies the transform to each value", async () => {
      const input = { a: "hello", b: "world" };
      const result = await mapValuesAsync(input, async (value) => value.toUpperCase());
      expect(result).toEqual({ a: "HELLO", b: "WORLD" });
    });
  });

  describe("when transforming to different types", () => {
    it("applies the transform to each value", async () => {
      const input = { a: 1, b: 2, c: 3 };
      const result = await mapValuesAsync(input, async (value) => value.toString());
      expect(result).toEqual({ a: "1", b: "2", c: "3" });
    });
  });

  describe("when using the key parameter", () => {
    it("applies the transform to each value", async () => {
      const input = { firstName: "John", lastName: "Doe" };
      const result = await mapValuesAsync(input, async (value, key) => `${key}: ${value}`);
      expect(result).toEqual({ firstName: "firstName: John", lastName: "lastName: Doe" });
    });
  });
});
