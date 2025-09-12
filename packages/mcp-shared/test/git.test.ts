import { assertGitInstalled, assertGitHubInstalled, diff } from "../src/git.js";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";
import dedent from "ts-dedent";

let mockSpawn: Mock<any>;

class SubprocessError extends Error { }

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

describe("assertGitHubInstalled", () => {
  beforeEach(() => {
    mockSpawn = mock(() => Promise.resolve({}));

    mock.module("nano-spawn", () => ({
      default: mockSpawn,
      SubprocessError,
    }));
  });

  it("calls gh without any arguments", async () => {
    await assertGitHubInstalled();

    expect(mockSpawn).toHaveBeenCalledWith("gh", []);
  });

  describe("when GitHub CLI is installed", () => {
    it("does not throw an error", async () => {
      return expect(assertGitHubInstalled()).resolves.toBeUndefined();
    });
  });

  describe("when GitHub CLI is not installed", () => {
    beforeEach(() => {
      mockSpawn.mockRejectedValue(new SubprocessError("Command not found"));
    });

    it("throws an error", async () => {
      return expect(assertGitHubInstalled()).rejects.toBeInstanceOf(Error);
    });
  });
});

describe("diff", () => {
  beforeEach(() => {
    mockSpawn = mock(() => Promise.resolve({ stdout: "" }));

    mock.module("nano-spawn", () => ({
      default: mockSpawn,
      SubprocessError,
    }));

    mockSpawn.mockImplementation(async (_command: string, args: string[]) => {
      if (args[0] === "log") {
        return {
          stdout: dedent`
              abc123 Fix bug in authentication
              def456 Add new feature
            `,
        };
      }

      if (args[0] === "diff") {
        return {
          stdout: dedent`
              diff --git a/file.txt b/file.txt
              index 123..456 100644
              --- a/file.txt
              +++ b/file.txt
              @@ -1,3 +1,3 @@
              -old line
              +new line
            `,
        };
      }

      return { stdout: "" };
    });
  });

  it("calls git log with the correct range", async () => {
    await diff("main", "feature");

    expect(mockSpawn).toHaveBeenNthCalledWith(1, "git", ["log", "main..feature", "--format=%h %s"]);
  });

  it("calls git diff with the correct range", async () => {
    await diff("main", "feature");

    expect(mockSpawn).toHaveBeenNthCalledWith(2, "git", ["diff", "main..feature"]);
  });

  describe("when there are no commits", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "" }));
    });

    it("returns empty commits array", async () => {
      const result = await diff("main", "feature");

      expect(result.commits).toEqual([]);
    });

    it("returns empty diff string", async () => {
      const result = await diff("main", "feature");

      expect(result.diff).toEqual("");
    });
  });

  describe("when there are commits", () => {
    it("returns parsed commits with sha and title", async () => {
      const result = await diff("main", "feature");

      expect(result.commits).toHaveLength(2);

      expect(result.commits).toEqual([
        {
          sha: "abc123",
          title: "Fix bug in authentication",
        },
        {
          sha: "def456",
          title: "Add new feature",
        },
      ]);
    });

    it("returns the diff output", async () => {
      const result = await diff("main", "feature");

      expect(result.diff).toContain("diff --git a/file.txt b/file.txt");
      expect(result.diff).toContain("-old line");
      expect(result.diff).toContain("+new line");
    });
  });
});
