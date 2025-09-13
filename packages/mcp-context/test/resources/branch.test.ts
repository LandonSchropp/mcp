import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach, mock } from "bun:test";
import dedent from "ts-dedent";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("resources/branch", () => {
  beforeEach(async () => {
    // Mock the git functions
    mock.module("@landonschropp/mcp-shared/git", () => ({
      getDefaultBranch: mock(async () => "main"),
      getCurrentBranch: mock(async () => "current-feature"),
      getDiff: mock(async () => ({
        commits: [
          { sha: "abc123", title: "Add new feature" },
          { sha: "def456", title: "Fix bug in login" },
        ],
        diff: dedent`
          diff --git a/src/feature.ts b/src/feature.ts
          index 123..456 100644
          --- a/src/feature.ts
          +++ b/src/feature.ts
          @@ -1,3 +1,5 @@
          +export function newFeature() {
          +  return 'hello world';
          +}
        `,
      })),
    }));

    client = await createTestClient(server);
  });

  it("uses getDefaultBranch to determine the base branch", async () => {
    const { getDefaultBranch } = await import("@landonschropp/mcp-shared/git");

    await client.readResource({
      uri: "context://branch/feature",
    });

    expect(getDefaultBranch).toHaveBeenCalled();
  });

  it("uses getDiff to get the diff", async () => {
    const { getDiff } = await import("@landonschropp/mcp-shared/git");

    await client.readResource({
      uri: "context://branch/my-branch",
    });

    expect(getDiff).toHaveBeenCalledWith("main", "my-branch");
  });

  it("returns JSON data showing the diff for the current branch", async () => {
    const result = await client.readResource({
      uri: "context://branch/feature",
    });

    expect(result.contents).toEqual([
      {
        uri: "context://branch/feature",
        mimeType: "application/json",
        text: expect.any(String),
      },
    ]);

    const diff = JSON.parse(result.contents[0].text as string);

    expect(diff).toEqual({
      commits: [
        { sha: "abc123", title: "Add new feature" },
        { sha: "def456", title: "Fix bug in login" },
      ],
      diff: expect.stringContaining("export function newFeature()"),
    });
  });

  describe("current branch resource", () => {
    it("calls getCurrentBranch to get the current branch", async () => {
      const { getCurrentBranch } = await import("@landonschropp/mcp-shared/git");

      await client.readResource({
        uri: "context://branch",
      });

      expect(getCurrentBranch).toHaveBeenCalled();
    });

    it("returns JSON data for the current branch", async () => {
      const result = await client.readResource({
        uri: "context://branch",
      });

      expect(result.contents).toEqual([
        {
          uri: "context://branch",
          mimeType: "application/json",
          text: expect.any(String),
        },
      ]);

      const diff = JSON.parse(result.contents[0].text as string);

      expect(diff).toEqual({
        commits: [
          { sha: "abc123", title: "Add new feature" },
          { sha: "def456", title: "Fix bug in login" },
        ],
        diff: expect.stringContaining("export function newFeature()"),
      });
    });

    it("calls getDiff with default branch and current branch", async () => {
      const { getDiff } = await import("@landonschropp/mcp-shared/git");

      await client.readResource({
        uri: "context://branch",
      });

      expect(getDiff).toHaveBeenCalledWith("main", "current-feature");
    });
  });
});
