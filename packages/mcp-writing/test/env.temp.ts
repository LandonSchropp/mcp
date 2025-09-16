import { describe, it, expect, beforeEach, afterEach } from "bun:test";

const ORIGINAL_ENV = process.env;

beforeEach(() => (process.env = { ...ORIGINAL_ENV }));
afterEach(() => (process.env = ORIGINAL_ENV));

describe("FORMAT_STYLE_GUIDE", () => {
  describe("when FORMAT_STYLE_GUIDE is set", () => {
    it("exports the value", () => {
      process.env.FORMAT_STYLE_GUIDE = "format-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { FORMAT_STYLE_GUIDE } = require("../src/env");

      expect(FORMAT_STYLE_GUIDE).toBe("format-guide");
    });
  });
});

describe("VOICE_STYLE_GUIDE", () => {
  describe("when VOICE_STYLE_GUIDE is set", () => {
    it("exports the value", () => {
      process.env.VOICE_STYLE_GUIDE = "voice-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { VOICE_STYLE_GUIDE } = require("../src/env");

      expect(VOICE_STYLE_GUIDE).toBe("voice-guide");
    });
  });
});

describe("IMPROVEMENT_STYLE_GUIDE", () => {
  describe("when IMPROVEMENT_STYLE_GUIDE is set", () => {
    it("exports the value", () => {
      process.env.IMPROVEMENT_STYLE_GUIDE = "weaknesses-guide";

      // Clear module cache and re-import
      delete require.cache[require.resolve("../src/env")];
      const { IMPROVEMENT_STYLE_GUIDE } = require("../src/env");

      expect(IMPROVEMENT_STYLE_GUIDE).toBe("weaknesses-guide");
    });
  });
});
