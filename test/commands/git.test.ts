import { assertInstalled } from "../../src/commands/assertions";
import {
  assertGitInstalled,
  getDiff,
  getDefaultBranch,
  getBaseBranch,
  getCurrentBranch,
  getBranches,
  isWorkingDirectoryClean,
  doesBranchExist,
  switchBranch,
  createBranch,
} from "../../src/commands/git";
import { SubprocessError } from "nano-spawn";
import spawn from "nano-spawn";
import dedent from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockAssertInstalled: Mock<typeof assertInstalled> = vi.hoisted(() => vi.fn());

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
    mockSpawn.mockImplementation((async (_command: string, args?: string[]) => {
      if (args?.[0] === "show-ref") {
        return { stdout: "", stderr: "" };
      }

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
    }) as Mock<typeof spawn>);
  });

  it("calls git log with the correct range", async () => {
    await getDiff("main", "feature");

    expect(mockSpawn).toHaveBeenCalledWith("git", ["log", "main..feature", "--format=%h %s"]);
  });

  it("calls git diff with the correct range", async () => {
    await getDiff("main", "feature");

    expect(mockSpawn).toHaveBeenCalledWith("git", ["diff", "main..feature"]);
  });

  describe("when there are no commits", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
    });

    it("returns null", async () => {
      const result = await getDiff("main", "feature");

      expect(result).toBeNull();
    });
  });

  describe("when a branch does not exist", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation(async (_command: string, args?: string[]) => {
        if (args?.[0] === "show-ref" && args?.includes("refs/heads/nonexistent")) {
          const error = new SubprocessError("fatal: ref refs/heads/nonexistent does not exist");
          error.exitCode = 1;
          throw error;
        }
        return { stdout: "", stderr: "" };
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
    mockSpawn.mockResolvedValue({ stdout: "main\n", stderr: "" });
  });

  it("calls git default-branch command", async () => {
    await getDefaultBranch();

    expect(mockSpawn).toHaveBeenCalledWith("git", ["default-branch"]);
  });

  it("returns the default branch name", async () => {
    const result = await getDefaultBranch();

    expect(result).toBe("main");
  });

  describe("when branch name has whitespace", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "  develop  \n", stderr: "" });
    });

    it("trims whitespace from branch name", async () => {
      const result = await getDefaultBranch();

      expect(result).toBe("develop");
    });
  });
});

describe("getBaseBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "main\n", stderr: "" });
  });

  it("delegates to getDefaultBranch", async () => {
    const result = await getBaseBranch("feature-branch");

    expect(mockSpawn).toHaveBeenCalledWith("git", ["default-branch"]);
    expect(result).toBe("main");
  });

  describe("when default branch is develop", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "develop\n", stderr: "" });
    });

    it("returns the default branch regardless of input branch", async () => {
      const result = await getBaseBranch("any-branch-name");

      expect(result).toBe("develop");
    });
  });
});

describe("getCurrentBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "feature-branch\n", stderr: "" });
  });

  it("calls git branch --show-current command", async () => {
    await getCurrentBranch();

    expect(mockSpawn).toHaveBeenCalledWith("git", ["branch", "--show-current"]);
  });

  it("returns the current branch name", async () => {
    const result = await getCurrentBranch();

    expect(result).toBe("feature-branch");
  });

  describe("when branch name has whitespace", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "  my-feature  \n", stderr: "" });
    });

    it("trims whitespace from branch name", async () => {
      const result = await getCurrentBranch();

      expect(result).toBe("my-feature");
    });
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
  });

  describe("when branch names have whitespace", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({
        stdout: "  main  \n  feature/test  \n",
        stderr: "",
      });
    });

    it("trims whitespace from branch names", async () => {
      const result = await getBranches();

      expect(result).toEqual(["main", "feature/test"]);
    });
  });
});

describe("isWorkingDirectoryClean", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
  });

  it("calls git status --porcelain", async () => {
    await isWorkingDirectoryClean();

    expect(mockSpawn).toHaveBeenCalledWith("git", ["status", "--porcelain"]);
  });

  describe("when working directory is clean", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
    });

    it("returns true", async () => {
      const result = await isWorkingDirectoryClean();

      expect(result).toBe(true);
    });
  });

  describe("when working directory has uncommitted changes", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation(() =>
        Promise.resolve({
          stdout: dedent`
            M  modified-file.txt
            D  deleted-file.txt
            ?? untracked-file.txt
          `,
          stderr: "",
        }),
      );
    });

    it("returns false", async () => {
      const result = await isWorkingDirectoryClean();

      expect(result).toBe(false);
    });
  });

  describe("when working directory has only whitespace in output", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "   \n  \n", stderr: "" });
    });

    it("returns true", async () => {
      const result = await isWorkingDirectoryClean();

      expect(result).toBe(true);
    });
  });
});

describe("doesBranchExist", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
  });

  it("calls git show-ref with the correct arguments", async () => {
    await doesBranchExist("feature-branch");

    expect(mockSpawn).toHaveBeenCalledWith("git", [
      "show-ref",
      "--verify",
      "--quiet",
      "refs/heads/feature-branch",
    ]);
  });

  describe("when the branch exists", () => {
    it("returns true", async () => {
      const result = await doesBranchExist("main");

      expect(result).toBe(true);
    });
  });

  describe("when the branch does not exist", () => {
    beforeEach(() => {
      const error = new SubprocessError("fatal: ref refs/heads/nonexistent does not exist");
      error.exitCode = 1;
      mockSpawn.mockRejectedValue(error);
    });

    it("returns false", async () => {
      const result = await doesBranchExist("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("when the git command fails with another error", () => {
    beforeEach(() => {
      const error = new SubprocessError("fatal: not a git repository");
      error.exitCode = 128;
      mockSpawn.mockRejectedValue(error);
    });

    it("returns false", async () => {
      const result = await doesBranchExist("any-branch");
      expect(result).toBe(false);
    });
  });
});

describe("switchBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
  });

  it("calls git switch with the branch name", async () => {
    await switchBranch("feature-branch");

    expect(mockSpawn).toHaveBeenCalledWith("git", ["switch", "feature-branch"]);
  });
});

describe("createBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
  });

  it("calls git switch -c with the branch name", async () => {
    await createBranch("new-feature");

    expect(mockSpawn).toHaveBeenCalledWith("git", ["switch", "-c", "new-feature"]);
  });
});
