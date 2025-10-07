import { assertInstalled } from "../../src/commands/assertions.js";
import { describe, it, expect } from "vitest";

describe("assertInstalled", () => {
  describe("when the command exists", () => {
    it("does not throw and error", async () => {
      return expect(assertInstalled("Echo", "echo")).resolves.toBeUndefined();
    });
  });

  describe("when the command does not exist", () => {
    it("throws an error", async () => {
      return expect(assertInstalled("Non-Existent Tool", "non-existent-tool")).rejects.toThrow(
        "Non-Existent Tool is not installed.",
      );
    });
  });

  describe("when the command exits with non-zero status", () => {
    it("throws an error", async () => {
      return expect(assertInstalled("False", "false")).rejects.toThrow("False is not installed.");
    });
  });

  describe("when the command is called with multiple arguments", () => {
    it("passes the arguments", async () => {
      return expect(assertInstalled("Git", "git", ["--version"])).resolves.toBeUndefined();
    });
  });
});
