import { assertClaudeInstalled, claude } from "../../src/commands/claude";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";

let mockSpawn: Mock<
  (command: string, args?: string[]) => Promise<{ stdout: string; stderr: string }>
>;

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

describe("claude", () => {
  beforeEach(() => {
    mockSpawn = mock(() => Promise.resolve({ stdout: "", stderr: "" }));

    mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "  Result  \n", stderr: "" }));

    mock.module("nano-spawn", () => ({
      default: mockSpawn,
    }));
  });

  it("calls claude with --print flag", async () => {
    await claude("echo 'Hello, world!'");

    expect(mockSpawn).toHaveBeenCalledWith("claude", ["--print", "echo 'Hello, world!'"]);
  });

  it("returns the trimmed stdout", async () => {
    const result = await claude("some command");

    expect(result).toBe("Result");
  });
});
