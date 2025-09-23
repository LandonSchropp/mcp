import { assertGitHubInstalled, getPullRequest } from "../../src/commands/github";
import dedent from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

let mockSpawn: Mock<
  (command: string, args?: string[]) => Promise<{ stdout: string; stderr: string }>
>;

class SubprocessError extends Error {
  exitCode?: number;
  signalName?: string;

  constructor(message: string, exitCode?: number, signalName?: string) {
    super(message);
    this.name = "SubprocessError";
    this.exitCode = exitCode;
    this.signalName = signalName;
  }
}

describe("assertGitHubInstalled", () => {
  let mockAssertInstalled: Mock<(name: string, command: string, args?: string[]) => Promise<void>>;

  beforeEach(() => {
    mockAssertInstalled = vi.fn(() => Promise.resolve());
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
      mockAssertInstalled = vi.fn(() => Promise.reject(new Error("GitHub is not installed.")));
      mock.module("../../src/commands/assertions", () => ({
        assertInstalled: mockAssertInstalled,
      }));
    });

    it("throws an error", async () => {
      return expect(assertGitHubInstalled()).rejects.toThrow("GitHub is not installed.");
    });
  });
});

describe("getPullRequest", () => {
  beforeEach(() => {
    mockSpawn = vi.fn(() => Promise.resolve({ stdout: "", stderr: "" }));

    mock.module("nano-spawn", () => ({
      default: mockSpawn,
      SubprocessError,
    }));
  });

  it("calls gh pr view with correct arguments", async () => {
    mockSpawn.mockImplementation(async (_command: string, args?: string[]) => {
      if (args?.[0] === "pr" && args?.[1] === "view") {
        return {
          stdout: JSON.stringify({
            title: "Fix authentication bug",
            body: "This PR fixes the authentication issue",
            baseRefName: "main",
            commits: [
              {
                oid: "abc1234567890",
                messageHeadline: "Fix bug",
              },
            ],
          }),
          stderr: "",
        };
      }
      if (args?.[0] === "pr" && args?.[1] === "diff") {
        return { stdout: "diff --git...", stderr: "" };
      }
      return { stdout: "", stderr: "" };
    });

    await getPullRequest("org/repo", "feature-branch");

    expect(mockSpawn).toHaveBeenCalledWith("gh", [
      "pr",
      "view",
      "feature-branch",
      "--repo",
      "org/repo",
      "--json",
      "title,body,commits,baseRefName",
    ]);
  });

  it("returns PR details with commits and diff", async () => {
    mockSpawn.mockImplementation(async (_command: string, args?: string[]) => {
      if (args?.[0] === "pr" && args?.[1] === "view") {
        return {
          stdout: JSON.stringify({
            title: "Add new feature",
            body: "This PR adds a new feature to the application",
            baseRefName: "develop",
            commits: [
              {
                oid: "abc1234567890",
                messageHeadline: "Add feature implementation",
              },
              {
                oid: "def4567890123",
                messageHeadline: "Update tests",
              },
            ],
          }),
          stderr: "",
        };
      }

      if (args?.[0] === "pr" && args?.[1] === "diff") {
        return {
          stdout: dedent`
            diff --git a/src/feature.ts b/src/feature.ts
            index 123..456 100644
            --- a/src/feature.ts
            +++ b/src/feature.ts
            @@ -1,3 +1,5 @@
            +export function newFeature() {
            +  return 'hello world';
            +}
          `,
          stderr: "",
        };
      }

      return { stdout: "", stderr: "" };
    });

    const result = await getPullRequest("org/repo", "feature-branch");

    expect(result).not.toBeNull();
    expect(result!.title).toBe("Add new feature");
    expect(result!.description).toBe("This PR adds a new feature to the application");
    expect(result!.baseBranch).toBe("develop");

    expect(result!.commits).toEqual([
      {
        sha: "abc1234",
        title: "Add feature implementation",
      },
      {
        sha: "def4567",
        title: "Update tests",
      },
    ]);

    expect(result!.diff).toContain("export function newFeature()");
  });

  describe("when no PR exists for the branch", () => {
    beforeEach(() => {
      mockSpawn.mockRejectedValue(new SubprocessError("no pull requests found", 1));
    });

    it("returns null", async () => {
      const result = await getPullRequest("org/repo", "no-pr-branch");

      expect(result).toBeNull();
    });
  });

  describe("when a subprocess error with exit code other than 1 occurs", () => {
    beforeEach(() => {
      mockSpawn.mockRejectedValue(new SubprocessError("Authentication failed", 2));
    });

    it("throws the error", async () => {
      return expect(getPullRequest("org/repo", "some-branch")).rejects.toThrow(
        "Authentication failed",
      );
    });
  });

  describe("when a non-subprocess error occurs", () => {
    beforeEach(() => {
      mockSpawn.mockRejectedValue(new Error("Network error"));
    });

    it("throws the error", async () => {
      return expect(getPullRequest("org/repo", "some-branch")).rejects.toThrow("Network error");
    });
  });
});
