import { assertGitHubInstalled, getPullRequest } from "../../src/commands/github";
import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";
import dedent from "ts-dedent";

let mockSpawn: Mock<
  (command: string, args?: string[]) => Promise<{ stdout: string; stderr: string }>
>;

describe("assertGitHubInstalled", () => {
  let mockAssertInstalled: Mock<(name: string, command: string, args?: string[]) => Promise<void>>;

  beforeEach(() => {
    mockAssertInstalled = mock(() => Promise.resolve());
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
      mockAssertInstalled = mock(() => Promise.reject(new Error("GitHub is not installed.")));
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
    mockSpawn = mock(() => Promise.resolve({ stdout: "", stderr: "" }));

    mock.module("nano-spawn", () => ({
      default: mockSpawn,
    }));
  });

  it("calls gh pr view with correct arguments", async () => {
    mockSpawn.mockImplementation(async (_command: string, args: string[]) => {
      if (args[0] === "pr" && args[1] === "view") {
        return {
          stdout: JSON.stringify({
            title: "Fix authentication bug",
            body: "This PR fixes the authentication issue",
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
      if (args[0] === "pr" && args[1] === "diff") {
        return { stdout: "diff --git...", stderr: "" };
      }
      return { stdout: "", stderr: "" };
    });

    await getPullRequest("org/repo", 123);

    expect(mockSpawn).toHaveBeenCalledWith("gh", [
      "pr",
      "view",
      "123",
      "--repo",
      "org/repo",
      "--json",
      "title,body,commits",
    ]);
  });

  it("returns PR details with commits and diff", async () => {
    mockSpawn.mockImplementation(async (_command: string, args: string[]) => {
      if (args[0] === "pr" && args[1] === "view") {
        return {
          stdout: JSON.stringify({
            title: "Add new feature",
            body: "This PR adds a new feature to the application",
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

      if (args[0] === "pr" && args[1] === "diff") {
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

    const result = await getPullRequest("org/repo", 123);

    expect(result.title).toBe("Add new feature");
    expect(result.description).toBe("This PR adds a new feature to the application");

    expect(result.commits).toEqual([
      {
        sha: "abc1234",
        title: "Add feature implementation",
      },
      {
        sha: "def4567",
        title: "Update tests",
      },
    ]);

    expect(result.diff).toContain("export function newFeature()");
  });
});
