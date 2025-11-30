import { createTestClient } from "../../test/helpers.js";
import { doesBranchExist, inferBaseBranch, getCommits, getDiff } from "../commands/git.js";
import { getPullRequest } from "../commands/github.js";
import { server } from "../server.js";
import { Client } from "@modelcontextprotocol/sdk/client";
import dedent from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockDoesBranchExist: Mock<typeof doesBranchExist> = vi.hoisted(() => vi.fn(async () => true));
const mockInferBaseBranch: Mock<typeof inferBaseBranch> = vi.hoisted(() =>
  vi.fn(async () => "main"),
);

const mockGetCommits: Mock<typeof getCommits> = vi.hoisted(() =>
  vi.fn(async () => [
    { sha: "abc123", title: "Add authentication" },
    { sha: "def456", title: "Fix login bug" },
  ]),
);

const mockGetDiff: Mock<typeof getDiff> = vi.hoisted(() =>
  vi.fn(
    async () =>
      dedent`diff --git a/auth.js b/auth.js
      new file mode 100644
      index 0000000..e69de29
      --- /dev/null
      +++ b/auth.js
      @@ -0,0 +1,10 @@
      +// Authentication module
      +// login
      +// logout
    `,
  ),
);

const mockGetPullRequest: Mock<typeof getPullRequest> = vi.hoisted(() => vi.fn(async () => null));

vi.mock("../commands/git", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    doesBranchExist: mockDoesBranchExist,
    inferBaseBranch: mockInferBaseBranch,
    getCommits: mockGetCommits,
    getDiff: mockGetDiff,
  };
});

vi.mock("../commands/github", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    getPullRequest: mockGetPullRequest,
  };
});

describe("tools/fetch_feature_branch", () => {
  let client: Client;

  beforeEach(async () => (client = await createTestClient(server)));

  it("registers the tool", async () => {
    const { tools } = await client.listTools();

    expect(tools).toContainEqual(
      expect.objectContaining({
        name: "fetch_feature_branch",
        description: expect.stringContaining("feature branch"),
      }),
    );
  });

  describe("when the branch is valid", () => {
    let result: any;
    let content: Record<string, any>;

    beforeEach(async () => {
      result = await client.callTool({
        name: "fetch_feature_branch",
        arguments: { branch: "feature/auth" },
      });
      content = JSON.parse(result?.content?.[0]?.text ?? "{}");
    });

    it("returns a single text result", async () => {
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual(
        expect.objectContaining({
          type: "text",
        }),
      );
    });

    it("includes the branch", () => {
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

    it("returns an error", async () => {
      const result = await client.callTool({
        name: "fetch_feature_branch",
        arguments: { branch: "nonexistent" },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toEqual([
        expect.objectContaining({
          type: "text",
          text: expect.stringContaining("Branch not found: nonexistent"),
        }),
      ]);
    });
  });

  describe("when the branch has no diff", () => {
    beforeEach(() => {
      mockDoesBranchExist.mockResolvedValue(true);
      mockGetCommits.mockResolvedValue(null);
      mockGetDiff.mockResolvedValue(null);
    });

    it("returns empty commits and diff", async () => {
      const result: any = await client.callTool({
        name: "fetch_feature_branch",
        arguments: { branch: "feature/nodiff" },
      });
      const content = JSON.parse(result?.content?.[0]?.text ?? "{}");

      expect(content.commits).toEqual([]);
      expect(content.diff).toEqual("");
      expect(content.branch).toEqual("feature/nodiff");
      expect(content.baseBranch).toEqual("main");
    });
  });

  describe("when there is no pull request", () => {
    beforeEach(() => {
      mockGetPullRequest.mockResolvedValue(null);
    });

    it("returns null for pullRequest", async () => {
      const result: any = await client.callTool({
        name: "fetch_feature_branch",
        arguments: { branch: "feature/auth" },
      });
      const content = JSON.parse(result?.content?.[0]?.text ?? "{}");

      expect(content.pullRequest).toBeNull();
    });
  });

  describe("when there is a pull request", () => {
    beforeEach(() => {
      mockGetPullRequest.mockResolvedValue({
        number: 123,
        url: "https://github.com/owner/repo/pull/123",
        title: "Add authentication feature",
        description: "This PR adds user authentication.",
        branch: "feature/auth",
        baseBranch: "main",
        commits: [],
        diff: "",
      });
    });

    it("includes the pull request info", async () => {
      const result: any = await client.callTool({
        name: "fetch_feature_branch",
        arguments: { branch: "feature/auth" },
      });
      const content = JSON.parse(result?.content?.[0]?.text ?? "{}");

      expect(content.pullRequest).toEqual({
        number: 123,
        url: "https://github.com/owner/repo/pull/123",
        title: "Add authentication feature",
        description: "This PR adds user authentication.",
      });
    });
  });
});
