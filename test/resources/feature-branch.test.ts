import { doesBranchExist, getBaseBranch, getBranches, getDiff } from "../../src/commands/git";
import { server } from "../../src/server";
import { createTestClient } from "../helpers";
import "../helpers";
import { Client } from "@modelcontextprotocol/sdk/client";
import { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import dedent from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const BRANCHES = ["main", "feature/auth", "feature/ui", "bugfix/login"];

const mockDoesBranchExist: Mock<typeof doesBranchExist> = vi.hoisted(() => vi.fn(async () => true));
const mockGetBaseBranch: Mock<typeof getBaseBranch> = vi.hoisted(() => vi.fn(async () => "main"));
const mockGetBranches: Mock<typeof getBranches> = vi.hoisted(() => vi.fn(async () => BRANCHES));

const mockGetDiff: Mock<typeof getDiff> = vi.hoisted(() =>
  vi.fn(async () => ({
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
  const actual = await importOriginal<typeof import("../../src/commands/git")>();
  return {
    ...actual,
    doesBranchExist: mockDoesBranchExist,
    getBaseBranch: mockGetBaseBranch,
    getBranches: mockGetBranches,
    getDiff: mockGetDiff,
  };
});

describe("git://feature-branch/{+branch}", () => {
  let client: Client;

  beforeEach(async () => (client = await createTestClient(server)));

  it("registers the resource", async () => {
    const { resourceTemplates } = await client.listResourceTemplates();

    expect(resourceTemplates).toContainEqual(
      expect.objectContaining({
        name: "feature-branch",
        description: expect.stringContaining("feature branch"),
      }),
    );
  });

  describe("when the branch is valid", () => {
    let result: ReadResourceResult;
    let content: Record<string, string>;

    beforeEach(async () => {
      result = await client.readResource({ uri: "git://feature-branch/feature/auth" });
      content = JSON.parse((result?.contents?.[0]?.text as string) ?? "{}");
    });

    it("returns a single result with the correct URI", async () => {
      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual(
        expect.objectContaining({
          uri: "git://feature-branch/feature/auth",
        }),
      );
    });

    it("includes the branch ", () => {
      expect(content.branch).toEqual("feature/auth");
    });

    it("includes the base branch", () => {
      expect(content.baseBranch).toEqual("main");
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

  describe("when the branch does not exist", () => {
    beforeEach(() => {
      mockDoesBranchExist.mockResolvedValue(false);
    });

    it("throws an error", async () => {
      await expect(
        client.readResource({ uri: "git://feature-branch/nonexistent" }),
      ).rejects.toThrow("Branch not found: nonexistent");
    });
  });

  describe("when the branch has no diff", () => {
    beforeEach(() => {
      mockDoesBranchExist.mockResolvedValue(true);
      mockGetDiff.mockResolvedValue(null);
    });

    it("returns empty commits and diff", async () => {
      const result = await client.readResource({ uri: "git://feature-branch/feature/nodiff" });
      const content = JSON.parse((result?.contents?.[0]?.text as string) ?? "{}");

      expect(content.commits).toEqual([]);
      expect(content.diff).toEqual("");
      expect(content.branch).toEqual("feature/nodiff");
      expect(content.baseBranch).toEqual("main");
    });
  });

  describe("branch parameter completion", () => {
    describe("when no part of the branch is specified", () => {
      it("provides all branches as completions", async () => {
        const completions = await client.complete({
          ref: {
            type: "ref/resource",
            uri: "git://feature-branch/{+branch}",
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
            uri: "git://feature-branch/{+branch}",
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
