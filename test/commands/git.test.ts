import {
  assertGitInstalled,
  getDiff,
  getDefaultBranch,
  getBaseBranch,
  getBranches,
} from "../../src/commands/git";
import { SubprocessError } from "nano-spawn";
import dedent from "ts-dedent";
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

describe("assertGitInstalled", () => {
  beforeEach(() => {
    mockAssertInstalled.mockResolvedValue(undefined);
  });

  it("calls assertInstalled with the correct parameters", async () => {
    await assertGitInstalled();

    expect(mockAssertInstalled).toHaveBeenCalledTimes(1);
    expect(mockAssertInstalled).toHaveBeenCalledWith("Git", "git", ["--version"]);
  });

  describe("when git is not installed", () => {
    beforeEach(() => {
      mockAssertInstalled.mockRejectedValue(new Error("Git is not installed."));
    });

    it("throws an error", async () => {
      return expect(assertGitInstalled()).rejects.toThrow("Git is not installed.");
    });
  });
});

describe("getDiff", () => {
  beforeEach(() => {
    mockSpawn.mockImplementation(async (_command: string, args?: string[]) => {
      if (args?.[0] === "log") {
        return {
          stdout: dedent`
              abc123 Fix bug in authentication
              def456 Add new feature
            `,
          stderr: "",
        };
      }

      if (args?.[0] === "diff") {
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
          stderr: "",
        };
      }

      return { stdout: "", stderr: "" };
    });
  });

  it("calls git log with the correct range", async () => {
    await getDiff("main", "feature");

    expect(mockSpawn).toHaveBeenNthCalledWith(1, "git", ["log", "main..feature", "--format=%h %s"]);
  });

  it("calls git diff with the correct range", async () => {
    await getDiff("main", "feature");

    expect(mockSpawn).toHaveBeenNthCalledWith(2, "git", ["diff", "main..feature"]);
  });

  describe("when there are no commits", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "", stderr: "" }));
    });

    it("returns null", async () => {
      const result = await getDiff("main", "feature");

      expect(result).toBeNull();
    });
  });

  describe("when a branch does not exist", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation(() => {
        const error = new SubprocessError(
          "fatal: ambiguous argument 'main..nonexistent': unknown revision or path not in the working tree.",
        );
        error.exitCode = 128;
        throw error;
      });
    });

    it("returns null", async () => {
      const result = await getDiff("main", "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("when there are commits", () => {
    it("returns parsed commits with sha and title", async () => {
      const result = await getDiff("main", "feature");

      expect(result!.commits).toHaveLength(2);

      expect(result!.commits).toEqual([
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
      const result = await getDiff("main", "feature");

      expect(result!.diff).toContain("diff --git a/file.txt b/file.txt");
      expect(result!.diff).toContain("-old line");
      expect(result!.diff).toContain("+new line");
    });
  });
});

describe("getDefaultBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
  });

  it("calls git default-branch command", async () => {
    mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "main\n", stderr: "" }));

    await getDefaultBranch();

    expect(mockSpawn).toHaveBeenCalledWith("git", ["default-branch"]);
  });

  it("returns the default branch name", async () => {
    mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "main\n", stderr: "" }));

    const result = await getDefaultBranch();

    expect(result).toBe("main");
  });

  it("trims whitespace from branch name", async () => {
    mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "  develop  \n", stderr: "" }));

    const result = await getDefaultBranch();

    expect(result).toBe("develop");
  });
});

describe("getBaseBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
  });

  it("delegates to getDefaultBranch", async () => {
    mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "main\n", stderr: "" }));

    const result = await getBaseBranch("feature-branch");

    expect(mockSpawn).toHaveBeenCalledWith("git", ["default-branch"]);
    expect(result).toBe("main");
  });

  it("returns the default branch regardless of input branch", async () => {
    mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "develop\n", stderr: "" }));

    const result = await getBaseBranch("any-branch-name");

    expect(result).toBe("develop");
  });
});

describe("getBranches", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
  });

  it("calls git branch with the correct format", async () => {
    await getBranches();

    expect(mockSpawn).toHaveBeenCalledWith("git", ["branch", "--format=%(refname:short)"]);
  });

  describe("when there are no branches", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation(() => Promise.resolve({ stdout: "", stderr: "" }));
    });

    it("returns empty array", async () => {
      const result = await getBranches();

      expect(result).toEqual([]);
    });
  });

  describe("when there are branches", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation(() =>
        Promise.resolve({
          stdout: dedent`
          main
          feature/new-ui
          bugfix/auth-issue
          develop
        `,
          stderr: "",
        }),
      );
    });

    it("returns array of branch names", async () => {
      const result = await getBranches();

      expect(result).toEqual(["main", "feature/new-ui", "bugfix/auth-issue", "develop"]);
    });

    it("trims whitespace from branch names", async () => {
      mockSpawn.mockImplementation(() =>
        Promise.resolve({
          stdout: "  main  \n  feature/test  \n",
          stderr: "",
        }),
      );

      const result = await getBranches();

      expect(result).toEqual(["main", "feature/test"]);
    });
  });
});
