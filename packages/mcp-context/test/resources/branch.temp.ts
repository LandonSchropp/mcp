import { server } from "../../src/server";
import { getDiff } from "@landonschropp/mcp-shared/git";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach, mock } from "vitest";
import dedent from "ts-dedent";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("resources/branch", () => {
  beforeEach(async () => {
    mock.module("@landonschropp/mcp-shared/git", () => ({
      getDefaultBranch: mock(async () => "main"),
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

  describe("when the branch name does not contain slashes", () => {
    it("uses getDiff to get the diff", async () => {
      await client.readResource({ uri: "context://branch/my-branch" });

      expect(getDiff).toHaveBeenCalledWith("main", "my-branch");
    });

    it("returns JSON data showing the diff for the branch", async () => {
      const result = await client.readResource({ uri: "context://branch/feature" });

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
  });

  describe("when the branch name contains slashes", () => {
    it("uses getDiff to get the diff", async () => {
      await client.readResource({ uri: "context://branch/feature/auth" });

      expect(getDiff).toHaveBeenCalledWith("main", "feature/auth");
    });

    it("returns JSON data showing the diff for the branch", async () => {
      const result = await client.readResource({ uri: "context://branch/feature/auth" });

      expect(result.contents).toEqual([
        {
          uri: "context://branch/feature/auth",
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
  });
});
