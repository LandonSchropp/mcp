import { assertInstalled } from "./assertions.js";
import {
  assertGitInstalled,
  getDiff,
  getDefaultBranch,
  inferBaseBranch,
  getCurrentBranch,
  getBranches,
  isWorkingDirectoryClean,
  doesBranchExist,
  switchBranch,
  createBranch,
} from "./git.js";
import { SubprocessError } from "nano-spawn";
import spawn from "nano-spawn";
import dedent from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockAssertInstalled: Mock<typeof assertInstalled> = vi.hoisted(() => vi.fn());

const mockSpawn: Mock<typeof spawn> = vi.hoisted(() => vi.fn() as Mock<typeof spawn>);

vi.mock("./assertions", () => ({
  assertInstalled: mockAssertInstalled,
}));

vi.mock("nano-spawn", async (importOriginal) => {
  return {
    ...(await importOriginal()),
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

    expect(mockSpawn).toHaveBeenCalledWith("git", ["diff", "main...feature"]);
  });

  describe("when there are no commits", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns null", async () => {
      const result = await getDiff("main", "feature");

      expect(result).toBeNull();
    });
  });

  describe("when a branch does not exist", () => {
    beforeEach(() => {
      mockSpawn.mockImplementation((async (_command: string, args?: string[]) => {
        if (args?.[0] === "show-ref" && args?.includes("refs/heads/nonexistent")) {
          const error = new SubprocessError("fatal: ref refs/heads/nonexistent does not exist");
          error.exitCode = 2;
          throw error;
        }
        return { stdout: "", stderr: "" };
      }) as Mock<typeof spawn>);
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
  describe("when the main branch exists", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({
        stdout: "feature\nmain\nother-branch\n",
        stderr: "",
      } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns main", async () => {
      const result = await getDefaultBranch();

      expect(result).toBe("main");
    });
  });

  describe("when the master branch exists", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({
        stdout: "feature\nmaster\nother-branch\n",
        stderr: "",
      } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns master", async () => {
      const result = await getDefaultBranch();

      expect(result).toBe("master");
    });
  });

  describe("when multiple branches exist", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({
        stdout: "main\nmaster\n",
        stderr: "",
      } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns the highest priority branch", async () => {
      const result = await getDefaultBranch();

      expect(result).toBe("main");
    });
  });

  describe("when no default branch exists", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({
        stdout: "feature\nother-branch\n",
        stderr: "",
      } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns main", async () => {
      const result = await getDefaultBranch();

      expect(result).toBe("main");
    });
  });
});

describe("inferBaseBranch", () => {
  describe("when log finds a parent branch", () => {
    beforeEach(() => {
      mockSpawn
        // First call: getBranches
        .mockResolvedValueOnce({
          stdout: "main\nfeature\n",
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>)
        // Second call: git log --format=%D
        .mockResolvedValueOnce({
          stdout: dedent`
            HEAD -> feature


            origin/main, main
          `,
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns the parent branch", async () => {
      const result = await inferBaseBranch("feature");

      expect(result).toBe("main");
    });
  });

  describe("when the branch was just created and points to the same commit as base", () => {
    beforeEach(() => {
      mockSpawn
        // First call: getBranches
        .mockResolvedValueOnce({
          stdout: "main\nfeature\n",
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>)
        // Second call: git log --format=%D (both branches on same commit)
        .mockResolvedValueOnce({
          stdout: dedent`
            HEAD -> feature, main
          `,
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns the base branch", async () => {
      const result = await inferBaseBranch("feature");

      expect(result).toBe("main");
    });
  });

  describe("when log finds only remote branches", () => {
    beforeEach(() => {
      mockSpawn
        // First call: getBranches
        .mockResolvedValueOnce({
          stdout: "main\nfeature\n",
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>)
        // Second call: git log --format=%D
        .mockResolvedValueOnce({
          stdout: dedent`
            HEAD -> feature


            origin/main
          `,
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>);
    });

    it("falls back to default branch", async () => {
      const result = await inferBaseBranch("feature");

      expect(result).toBe("main");
    });
  });

  describe("when log does not find any parent branch", () => {
    beforeEach(() => {
      mockSpawn
        // First call: getBranches
        .mockResolvedValueOnce({
          stdout: "main\nfeature\n",
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>)
        // Second call: git log --format=%D (no decorations found)
        .mockResolvedValueOnce({
          stdout: dedent`
            HEAD -> feature


          `,
          stderr: "",
        } as Awaited<ReturnType<typeof spawn>>);
    });

    it("falls back to default branch", async () => {
      const result = await inferBaseBranch("feature");

      expect(result).toBe("main");
    });
  });
});

describe("getCurrentBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "feature-branch\n", stderr: "" } as Awaited<
      ReturnType<typeof spawn>
    >);
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
      mockSpawn.mockResolvedValue({ stdout: "  my-feature  \n", stderr: "" } as Awaited<
        ReturnType<typeof spawn>
      >);
    });

    it("trims whitespace from branch name", async () => {
      const result = await getCurrentBranch();

      expect(result).toBe("my-feature");
    });
  });
});

describe("getBranches", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
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
      mockSpawn.mockResolvedValue({
        stdout: dedent`
          main
          feature/new-ui
          bugfix/auth-issue
          develop
        `,
        stderr: "",
      } as Awaited<ReturnType<typeof spawn>>);
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
      } as Awaited<ReturnType<typeof spawn>>);
    });

    it("trims whitespace from branch names", async () => {
      const result = await getBranches();

      expect(result).toEqual(["main", "feature/test"]);
    });
  });
});

describe("isWorkingDirectoryClean", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
  });

  it("calls git status --porcelain", async () => {
    await isWorkingDirectoryClean();

    expect(mockSpawn).toHaveBeenCalledWith("git", ["status", "--porcelain"]);
  });

  describe("when working directory is clean", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns true", async () => {
      const result = await isWorkingDirectoryClean();

      expect(result).toBe(true);
    });
  });

  describe("when working directory has uncommitted changes", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({
        stdout: dedent`
          M  modified-file.txt
          D  deleted-file.txt
          ?? untracked-file.txt
        `,
        stderr: "",
      } as Awaited<ReturnType<typeof spawn>>);
    });

    it("returns false", async () => {
      const result = await isWorkingDirectoryClean();

      expect(result).toBe(false);
    });
  });

  describe("when working directory has only whitespace in output", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "   \n  \n", stderr: "" } as Awaited<
        ReturnType<typeof spawn>
      >);
    });

    it("returns true", async () => {
      const result = await isWorkingDirectoryClean();

      expect(result).toBe(true);
    });
  });
});

describe("doesBranchExist", () => {
  describe("when the branch is a local branch", () => {
    beforeEach(() => {
      mockSpawn.mockResolvedValue({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
    });

    it("checks the local ref", async () => {
      await doesBranchExist("feature-branch");

      expect(mockSpawn).toHaveBeenCalledWith("git", [
        "show-ref",
        "--verify",
        "--quiet",
        "refs/heads/feature-branch",
      ]);
    });

    it("returns true", async () => {
      const result = await doesBranchExist("main");

      expect(result).toBe(true);
    });
  });

  describe("when the branch is a remote branch", () => {
    beforeEach(() => {
      const localError = new SubprocessError("fatal: ref refs/heads/origin/main does not exist");
      localError.exitCode = 2;

      mockSpawn
        .mockRejectedValueOnce(localError)
        .mockResolvedValueOnce({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
    });

    it("checks both local and remote refs", async () => {
      await doesBranchExist("origin/main");

      expect(mockSpawn).toHaveBeenCalledWith("git", [
        "show-ref",
        "--verify",
        "--quiet",
        "refs/heads/origin/main",
      ]);
      expect(mockSpawn).toHaveBeenCalledWith("git", [
        "show-ref",
        "--verify",
        "--quiet",
        "refs/remotes/origin/main",
      ]);
    });

    it("returns true", async () => {
      const result = await doesBranchExist("origin/main");

      expect(result).toBe(true);
    });
  });

  describe("when the branch is neither a local branch nor a remote branch", () => {
    beforeEach(() => {
      const error = new SubprocessError("fatal: ref does not exist");
      error.exitCode = 2;
      mockSpawn.mockRejectedValue(error);
    });

    it("checks both local and remote refs", async () => {
      await doesBranchExist("nonexistent");

      expect(mockSpawn).toHaveBeenCalledWith("git", [
        "show-ref",
        "--verify",
        "--quiet",
        "refs/heads/nonexistent",
      ]);
      expect(mockSpawn).toHaveBeenCalledWith("git", [
        "show-ref",
        "--verify",
        "--quiet",
        "refs/remotes/nonexistent",
      ]);
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
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
  });

  it("calls git switch with the branch name", async () => {
    await switchBranch("feature-branch");

    expect(mockSpawn).toHaveBeenCalledWith("git", ["switch", "feature-branch"]);
  });
});

describe("createBranch", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" } as Awaited<ReturnType<typeof spawn>>);
  });

  describe("when no base branch is provided", () => {
    it("calls git switch -c with the branch name", async () => {
      await createBranch("new-feature");

      expect(mockSpawn).toHaveBeenCalledWith("git", ["switch", "-c", "new-feature"]);
    });
  });

  describe("when a base branch is provided", () => {
    it("calls git switch -c with the branch name and base branch", async () => {
      await createBranch("new-feature", "main");

      expect(mockSpawn).toHaveBeenCalledWith("git", ["switch", "-c", "new-feature", "main"]);
    });
  });
});
