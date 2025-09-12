import { assertGitInstalled } from "../src/git.js";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";

let mockSpawn: Mock<any>;

class SubprocessError extends Error {}

describe("assertGitInstalled", () => {
  beforeEach(() => {
    mockSpawn = mock(() => Promise.resolve({}));

    mock.module("nano-spawn", () => ({
      default: mockSpawn,
      SubprocessError,
    }));
  });

  it("calls git with the --version flag", async () => {
    await assertGitInstalled();

    expect(mockSpawn).toHaveBeenCalledWith("git", ["--version"]);
  });

  describe("when Git is installed", () => {
    it("does not throw an error", async () => {
      return expect(assertGitInstalled()).resolves.toBeUndefined();
    });
  });

  describe("when Git is not installed", () => {
    beforeEach(() => {
      mockSpawn.mockRejectedValue(new SubprocessError("Command not found"));
    });

    it("throws an error", async () => {
      return expect(assertGitInstalled()).rejects.toBeInstanceOf(Error);
    });
  });
});
