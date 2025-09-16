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

beforeEach(() => (process.env = { ...ORIGINAL_ENV }));
afterEach(() => (process.env = ORIGINAL_ENV));

describe("WRITING_FORMAT", () => {
  describe("when WRITING_FORMAT is set", () => {
    it("exports the value", () => {
      process.env.WRITING_FORMAT = "format-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { WRITING_FORMAT } = require("../src/env");

      expect(WRITING_FORMAT).toBe("format-guide");
    });
  });
});

describe("WRITING_VOICE", () => {
  describe("when WRITING_VOICE is set", () => {
    it("exports the value", () => {
      process.env.WRITING_VOICE = "voice-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { WRITING_VOICE } = require("../src/env");

      expect(WRITING_VOICE).toBe("voice-guide");
    });
  });
});

describe("WRITING_IMPROVEMENT", () => {
  describe("when WRITING_IMPROVEMENT is set", () => {
    it("exports the value", () => {
      process.env.WRITING_IMPROVEMENT = "weaknesses-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { WRITING_IMPROVEMENT } = require("../src/env");

      expect(WRITING_IMPROVEMENT).toBe("weaknesses-guide");
    });
  });
});
