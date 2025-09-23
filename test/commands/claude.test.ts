import { assertClaudeInstalled, claude } from "../../src/commands/claude";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAssertInstalled = vi.hoisted(() => vi.fn());
const mockSpawn = vi.hoisted(() => vi.fn());

vi.mock("../../src/commands/assertions", () => ({
  assertInstalled: mockAssertInstalled,
}));

vi.mock("nano-spawn", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("nano-spawn")>()),
    default: mockSpawn,
  };
});

describe("assertClaudeInstalled", () => {
  beforeEach(() => {
    mockAssertInstalled.mockResolvedValue(undefined);
  });

  it("calls assertInstalled with the correct parameters", async () => {
    await assertClaudeInstalled();

    expect(mockAssertInstalled).toHaveBeenCalledTimes(1);
    expect(mockAssertInstalled).toHaveBeenCalledWith("Claude Code", "claude", ["--version"]);
  });

  describe("when claude is not installed", () => {
    beforeEach(() => {
      mockAssertInstalled.mockRejectedValue(new Error("Claude Code is not installed."));
    });

    it("throws an error", async () => {
      return expect(assertClaudeInstalled()).rejects.toThrow("Claude Code is not installed.");
    });
  });
});

describe("claude", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "  Result  \n", stderr: "" });
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
