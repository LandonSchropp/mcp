import { assertClaudeInstalled, claude } from "../../src/commands/claude";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";

let mockSpawn: Mock<
  (command: string, args?: string[]) => Promise<{ stdout: string; stderr: string }>
>;

describe("assertClaudeInstalled", () => {
  let mockAssertInstalled: Mock<(name: string, command: string, args?: string[]) => Promise<void>>;

  beforeEach(() => {
    mockAssertInstalled = mock(() => Promise.resolve());
    mock.module("../../src/commands/assertions", () => ({
      assertInstalled: mockAssertInstalled,
    }));
  });

  it("calls assertInstalled with the correct parameters", async () => {
    await assertClaudeInstalled();

    expect(mockAssertInstalled).toHaveBeenCalledTimes(1);
    expect(mockAssertInstalled).toHaveBeenCalledWith("Claude Code", "claude", ["--version"]);
  });

  describe("when claude is not installed", () => {
    beforeEach(() => {
      mockAssertInstalled = mock(() => Promise.reject(new Error("Claude Code is not installed.")));
      mock.module("../../src/commands/assertions", () => ({
        assertInstalled: mockAssertInstalled,
      }));
    });

    it("throws an error", async () => {
      return expect(assertClaudeInstalled()).rejects.toThrow("Claude Code is not installed.");
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
