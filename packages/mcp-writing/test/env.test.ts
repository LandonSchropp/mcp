import { describe, it, expect, beforeEach, afterEach } from "bun:test";

const ORIGINAL_ENV = process.env;

describe("requireEnvironmentVariable", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

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

describe("FORMATTING_STYLE_GUIDE", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("when FORMATTING_STYLE_GUIDE is set", () => {
    it("exports the value", () => {
      process.env.FORMATTING_STYLE_GUIDE = "formatting-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { FORMATTING_STYLE_GUIDE } = require("../src/env");

      expect(FORMATTING_STYLE_GUIDE).toBe("formatting-guide");
    });
  });
});

describe("LANGUAGE_STYLE_GUIDE", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("when LANGUAGE_STYLE_GUIDE is set", () => {
    it("exports the value", () => {
      process.env.LANGUAGE_STYLE_GUIDE = "language-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { LANGUAGE_STYLE_GUIDE } = require("../src/env");

      expect(LANGUAGE_STYLE_GUIDE).toBe("language-guide");
    });
  });
});
