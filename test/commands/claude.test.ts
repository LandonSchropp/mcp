import { assertClaudeInstalled } from "../../src/commands/claude";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";

describe("assertClaudeInstalled", () => {
  let mockAssertInstalled: Mock<(name: string, command: string, args?: string[]) => void>;

  beforeEach(() => {
    mockAssertInstalled = mock(() => {});
    mock.module("../../src/commands/assertions", () => ({
      assertInstalled: mockAssertInstalled,
    }));
  });

  it("calls assertInstalled with the correct parameters", () => {
    assertClaudeInstalled();

    expect(mockAssertInstalled).toHaveBeenCalledTimes(1);
    expect(mockAssertInstalled).toHaveBeenCalledWith("Claude Code", "claude", ["--version"]);
  });

  describe("when claude is not installed", () => {
    beforeEach(() => {
      mockAssertInstalled = mock(() => {
        throw new Error("Claude Code is not installed.");
      });
      mock.module("../../src/commands/assertions", () => ({
        assertInstalled: mockAssertInstalled,
      }));
    });

    it("throws an error", () => {
      expect(() => assertClaudeInstalled()).toThrow("Claude Code is not installed.");
    });
  });
});
