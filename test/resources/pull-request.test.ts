import { getBranches } from "../../src/commands/git";
import { getPullRequest } from "../../src/commands/github";
import { server } from "../../src/server";
import { createTestClient } from "../helpers";
import "../helpers";
import { Client } from "@modelcontextprotocol/sdk/client";
import { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import dedent from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const BRANCHES = ["main", "feature/auth", "feature/ui", "bugfix/login"];

const mockGetBranches: Mock<typeof getBranches> = vi.hoisted(() => vi.fn(async () => BRANCHES));

const mockGetPullRequest: Mock<typeof getPullRequest> = vi.hoisted(() =>
  vi.fn(async () => ({
    title: "Add authentication feature",
    description: "This PR adds authentication to the application",
    branch: "feature/auth",
    baseBranch: "main",
    commits: [
      { sha: "abc123", title: "Add authentication" },
      { sha: "def456", title: "Fix login bug" },
    ],
    diff: dedent`diff --git a/auth.js b/auth.js
      new file mode 100644
      index 0000000..e69de29
      --- /dev/null
      +++ b/auth.js
      @@ -0,0 +1,10 @@
      +// Authentication module
      +// login
      +// logout
    `,
  })),
);

vi.mock("../../src/commands/git", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    getBranches: mockGetBranches,
  };
});

vi.mock("../../src/commands/github", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    getPullRequest: mockGetPullRequest,
  };
});

describe("github://pull-request/{+branch}", () => {
  let client: Client;

  beforeEach(async () => (client = await createTestClient(server)));

  it("registers the resource", async () => {
    const { resourceTemplates } = await client.listResourceTemplates();

    expect(resourceTemplates).toContainEqual(
      expect.objectContaining({
        name: "pull-request",
        description: expect.stringContaining("pull request"),
      }),
    );
  });

  describe("when a pull request exists for the branch", () => {
    let result: ReadResourceResult;
    let content: Record<string, any>;

    beforeEach(async () => {
      result = await client.readResource({ uri: "github://pull-request/feature/auth" });
      content = JSON.parse((result?.contents?.[0]?.text as string) ?? "{}");
    });

    it("returns a single result with the correct URI", async () => {
      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual(
        expect.objectContaining({
          uri: "github://pull-request/feature/auth",
        }),
      );
    });

    it("includes the branch", () => {
      expect(content.branch).toEqual("feature/auth");
    });

    it("includes the base branch", () => {
      expect(content.baseBranch).toEqual("main");
    });

    it("includes the title", () => {
      expect(content.title).toEqual("Add authentication feature");
    });

    it("includes the description", () => {
      expect(content.description).toEqual("This PR adds authentication to the application");
    });

    it("includes the commits", () => {
      expect(content.commits).toEqual([
        { sha: "abc123", title: "Add authentication" },
        { sha: "def456", title: "Fix login bug" },
      ]);
    });

    it("includes the diff", () => {
      expect(content.diff).toEqual(expect.stringContaining("diff --git a/auth.js b/auth.js"));
    });
  });

  describe("when no pull request exists for the branch", () => {
    beforeEach(() => {
      mockGetPullRequest.mockResolvedValue(null);
    });

    it("throws an McpError error", async () => {
      return expect(
        client.readResource({ uri: "github://pull-request/bugfix/login" }),
      ).rejects.toThrowError(
        expect.objectContaining({
          message: expect.stringContaining("No pull request found for branch: bugfix/login"),
        }),
      );
    });
  });

  describe("branch parameter completion", () => {
    describe("when no part of the branch is specified", () => {
      it("provides all branches as completions", async () => {
        const completions = await client.complete({
          ref: {
            type: "ref/resource",
            uri: "github://pull-request/{+branch}",
          },
          argument: {
            name: "branch",
            value: "",
          },
        });

        expect(completions.completion.values).toHaveSameMembers(BRANCHES);
      });
    });

    describe("when part of the branch is specified", () => {
      it("provides matching branches as completions", async () => {
        const completions = await client.complete({
          ref: {
            type: "ref/resource",
            uri: "github://pull-request/{+branch}",
          },
          argument: {
            name: "branch",
            value: "feat",
          },
        });

        expect(completions.completion.values).toHaveSameMembers(BRANCHES.slice(1, 3));
      });
    });
  });
});
