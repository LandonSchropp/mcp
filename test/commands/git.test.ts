import { assertGitInstalled } from "../../src/commands/git";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";

describe("assertGitInstalled", () => {
  let mockAssertInstalled: Mock<(name: string, command: string, args?: string[]) => Promise<void>>;

  beforeEach(() => {
    mockAssertInstalled = mock(() => Promise.resolve());
    mock.module("../../src/commands/assertions", () => ({
      assertInstalled: mockAssertInstalled,
    }));
  });

  it("calls assertInstalled with the correct parameters", async () => {
    await assertGitInstalled();

    expect(mockAssertInstalled).toHaveBeenCalledTimes(1);
    expect(mockAssertInstalled).toHaveBeenCalledWith("Git", "git", ["--version"]);
  });

  describe("when git is not installed", () => {
    beforeEach(() => {
      mockAssertInstalled = mock(() => Promise.reject(new Error("Git is not installed.")));
      mock.module("../../src/commands/assertions", () => ({
        assertInstalled: mockAssertInstalled,
      }));
    });

    it("throws an error", async () => {
      return expect(assertGitInstalled()).rejects.toThrow("Git is not installed.");
    });
  });
});
