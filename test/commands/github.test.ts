import { assertInstalled } from "../../src/commands/assertions";
import { assertGitHubInstalled, getPullRequest } from "../../src/commands/github";
import { SubprocessError } from "nano-spawn";
import dedent from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockAssertInstalled: Mock<typeof assertInstalled> = vi.hoisted(() => vi.fn());
const mockSpawn = vi.hoisted(() => vi.fn());

vi.mock("../../src/commands/assertions", () => ({
  assertInstalled: mockAssertInstalled,
}));

vi.mock("nano-spawn", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    default: mockSpawn,
  };
});

describe("assertGitHubInstalled", () => {
  beforeEach(() => {
    mockAssertInstalled.mockResolvedValue(undefined);
  });

  it("calls assertInstalled with the correct parameters", async () => {
    await assertGitHubInstalled();

    expect(mockAssertInstalled).toHaveBeenCalledTimes(1);
    expect(mockAssertInstalled).toHaveBeenCalledWith("GitHub", "gh");
  });

  describe("when github cli is not installed", () => {
    beforeEach(() => {
      mockAssertInstalled.mockRejectedValue(new Error("GitHub is not installed."));
    });

    it("throws an error", async () => {
      return expect(assertGitHubInstalled()).rejects.toThrow("GitHub is not installed.");
    });
  });
});

describe("getPullRequest", () => {
  beforeEach(() => {
    mockSpawn.mockResolvedValue({ stdout: "", stderr: "" });
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

    await getPullRequest("feature-branch");

    expect(mockSpawn).toHaveBeenCalledWith("gh", [
      "pr",
      "view",
      "feature-branch",
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

    const result = await getPullRequest("feature-branch");

    expect(result).toEqual({
      title: "Add new feature",
      description: "This PR adds a new feature to the application",
      branch: "feature-branch",
      baseBranch: "develop",
      commits: [
        { sha: "abc1234", title: "Add feature implementation" },
        { sha: "def4567", title: "Update tests" },
      ],
      diff: expect.stringContaining("export function newFeature()"),
    });
  });

  describe("when no PR exists for the branch", () => {
    beforeEach(() => {
      const error = new SubprocessError("no pull requests found");
      error.exitCode = 1;
      mockSpawn.mockRejectedValue(error);
    });

    it("returns null", async () => {
      const result = await getPullRequest("no-pr-branch");

      expect(result).toBeNull();
    });
  });

  describe("when a subprocess error with exit code other than 1 occurs", () => {
    beforeEach(() => {
      const error = new SubprocessError("Authentication failed");
      error.exitCode = 2;
      mockSpawn.mockRejectedValue(error);
    });

    it("throws the error", async () => {
      return expect(getPullRequest("some-branch")).rejects.toThrow("Authentication failed");
    });
  });

  describe("when a non-subprocess error occurs", () => {
    beforeEach(() => {
      mockSpawn.mockRejectedValue(new Error("Network error"));
    });

    it("throws the error", async () => {
      return expect(getPullRequest("some-branch")).rejects.toThrow("Network error");
    });
  });
});
