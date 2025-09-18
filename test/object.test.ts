import { mapValues } from "../src/object";
import { describe, it, expect } from "bun:test";

describe("mapValues", () => {
  describe("when given an empty object", () => {
    it("returns an empty object", () => {
      const result = mapValues({}, (value) => value);
      expect(result).toEqual({});
    });
  });

  describe("when transforming values", () => {
    it("applies the transform to each value", () => {
      const input = { a: "hello", b: "world" };
      const result = mapValues(input, (value) => value.toUpperCase());
      expect(result).toEqual({ a: "HELLO", b: "WORLD" });
    });
  });

  describe("when transforming to different types", () => {
    it("applies the transform to each value", () => {
      const input = { a: 1, b: 2, c: 3 };
      const result = mapValues(input, (value) => value.toString());
      expect(result).toEqual({ a: "1", b: "2", c: "3" });
    });
  });

  describe("when using the key parameter", () => {
    it("applies the transform to each value", () => {
      const input = { firstName: "John", lastName: "Doe" };
      const result = mapValues(input, (value, key) => `${key}: ${value}`);
      expect(result).toEqual({ firstName: "firstName: John", lastName: "lastName: Doe" });
    });
  });
});
