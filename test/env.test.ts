import { describe, it, expect, beforeEach, afterEach } from "bun:test";

const ORIGINAL_ENV = process.env;

beforeEach(() => (process.env = { ...ORIGINAL_ENV }));
afterEach(() => (process.env = ORIGINAL_ENV));

describe("requireEnvironmentVariable", () => {
  describe("when environment variable is set", () => {
    it("returns the value", () => {
      process.env.TEST_VAR = "test-value";

      // Import after setting env var to get fresh module
      const { requireEnvironmentVariable } = require("../src/env");

      expect(requireEnvironmentVariable("TEST_VAR")).toBe("test-value");
    });
  });

  describe("when environment variable is not set", () => {
    it("throws an error with descriptive message", () => {
      delete process.env.TEST_VAR;

      const { requireEnvironmentVariable } = require("../src/env");

      expect(() => requireEnvironmentVariable("TEST_VAR")).toThrow(
        "Environment variable $TEST_VAR is required but not set",
      );
    });
  });

  describe("when environment variable is empty string", () => {
    it("throws an error", () => {
      process.env.TEST_VAR = "";

      const { requireEnvironmentVariable } = require("../src/env");

      expect(() => requireEnvironmentVariable("TEST_VAR")).toThrow(
        "Environment variable $TEST_VAR is required but not set",
      );
    });
  });
});
