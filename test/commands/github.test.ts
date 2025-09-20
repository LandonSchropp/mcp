import { assertGitHubInstalled } from "../../src/commands/github";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";

describe("assertGitHubInstalled", () => {
  let mockAssertInstalled: Mock<(name: string, command: string, args?: string[]) => Promise<void>>;

  beforeEach(() => {
    mockAssertInstalled = mock(() => Promise.resolve());
    mock.module("../../src/commands/assertions", () => ({
      assertInstalled: mockAssertInstalled,
    }));
  });

  it("calls assertInstalled with the correct parameters", async () => {
    await assertGitHubInstalled();

    expect(mockAssertInstalled).toHaveBeenCalledTimes(1);
    expect(mockAssertInstalled).toHaveBeenCalledWith("GitHub", "gh");
  });

  describe("when github cli is not installed", () => {
    beforeEach(() => {
      mockAssertInstalled = mock(() => Promise.reject(new Error("GitHub is not installed.")));
      mock.module("../../src/commands/assertions", () => ({
        assertInstalled: mockAssertInstalled,
      }));
    });

    it("throws an error", async () => {
      return expect(assertGitHubInstalled()).rejects.toThrow("GitHub is not installed.");
    });
  });
});
