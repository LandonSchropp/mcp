import { createTestClient } from "../../../test/helpers.js";
import { inferBaseBranch } from "../../commands/git.js";
import { server } from "../../server.js";
import { Client } from "@modelcontextprotocol/sdk/client";
import { mkdir, rm, readFile, readdir } from "fs/promises";
import { join } from "path";
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";

let PLANS_DIRECTORY = await vi.hoisted(async () => {
  const { tmpdir } = await import("os");
  const { join } = await import("path");

  return join(tmpdir(), `plans-${Date.now()}`);
});

const mockInferBaseBranch: Mock<typeof inferBaseBranch> = vi.hoisted(() =>
  vi.fn(async () => "main"),
);

vi.mock("../../env.ts", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    PLANS_DIRECTORY: PLANS_DIRECTORY,
  };
});

vi.mock("../../commands/git.js", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    inferBaseBranch: mockInferBaseBranch,
  };
});

describe("create_plan_template tool", () => {
  let client: Client;

  beforeEach(async () => {
    await mkdir(PLANS_DIRECTORY, { recursive: true });
    client = await createTestClient(server);
  });

  afterEach(async () => await rm(PLANS_DIRECTORY, { recursive: true, force: true }));

  it("registers the tool", async () => {
    const { tools } = await client.listTools();

    expect(tools).toContainEqual(
      expect.objectContaining({
        name: "create_plan_template",
        description: "Creates an plan template",
      }),
    );
  });

  describe("when creating a feature plan", () => {
    describe("without a Linear issue ID", () => {
      let result: any;

      beforeEach(async () => {
        result = await client.callTool({
          name: "create_plan_template",
          arguments: {
            title: "User Authentication",
            type: "feature",
            featureBranch: "auth-feature",
          },
        });
      });

      it("generates the plan file with correct naming", async () => {
        const branchDir = join(PLANS_DIRECTORY, "auth-feature");
        const files = await readdir(branchDir);

        expect(files).toHaveLength(1);
        expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_feature\.md$/);
      });

      it("includes the feature header", async () => {
        const branchDir = join(PLANS_DIRECTORY, "auth-feature");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("# User Authentication Implementation Plan");
      });

      it("includes the feature branch", async () => {
        const branchDir = join(PLANS_DIRECTORY, "auth-feature");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("Feature branch: `auth-feature`");
      });

      it("returns a resource link", async () => {
        expect(result.content).toEqual([
          expect.objectContaining({
            type: "resource_link",
            mimeType: "text/markdown",
            description: "Generated feature plan template file",
            name: expect.stringMatching(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_feature\.md$/),
            uri: expect.stringMatching(
              /^file:\/\/\/.*\/auth-feature\/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_feature\.md$/,
            ),
          }),
        ]);
      });
    });

    describe("with a Linear issue ID", () => {
      beforeEach(async () => {
        await client.callTool({
          name: "create_plan_template",
          arguments: {
            title: "User Authentication",
            type: "feature",
            featureBranch: "auth-feature-linear",
            linearIssueId: "ABC-123",
          },
        });
      });

      it("includes the Linear issue ID in the content", async () => {
        const branchDir = join(PLANS_DIRECTORY, "auth-feature-linear");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("Linear Issue ID: `ABC-123`");
      });
    });
  });

  describe("when creating a refactor plan", () => {
    describe("without a Linear issue ID", () => {
      let result: any;

      beforeEach(async () => {
        result = await client.callTool({
          name: "create_plan_template",
          arguments: {
            title: "Database Layer",
            type: "refactor",
            featureBranch: "db-refactor",
          },
        });
      });

      it("generates the plan file with correct naming", async () => {
        const branchDir = join(PLANS_DIRECTORY, "db-refactor");
        const files = await readdir(branchDir);

        expect(files).toHaveLength(1);
        expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_refactor\.md$/);
      });

      it("includes the refactor header", async () => {
        const branchDir = join(PLANS_DIRECTORY, "db-refactor");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("# Database Layer Refactor");
      });

      it("includes the feature branch", async () => {
        const branchDir = join(PLANS_DIRECTORY, "db-refactor");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("Feature branch: `db-refactor`");
      });

      it("returns a resource link", async () => {
        expect(result.content).toEqual([
          expect.objectContaining({
            type: "resource_link",
            mimeType: "text/markdown",
            description: "Generated refactor plan template file",
            name: expect.stringMatching(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_refactor\.md$/),
            uri: expect.stringMatching(
              /^file:\/\/\/.*\/db-refactor\/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_refactor\.md$/,
            ),
          }),
        ]);
      });
    });

    describe("with a Linear issue ID", () => {
      beforeEach(async () => {
        await client.callTool({
          name: "create_plan_template",
          arguments: {
            title: "Database Layer",
            type: "refactor",
            featureBranch: "db-refactor-linear",
            linearIssueId: "DEF-456",
          },
        });
      });

      it("includes the Linear issue ID in the content", async () => {
        const branchDir = join(PLANS_DIRECTORY, "db-refactor-linear");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("Linear Issue ID: `DEF-456`");
      });
    });
  });

  describe("when creating a bug-fix plan", () => {
    describe("without optional parameters", () => {
      let result: any;

      beforeEach(async () => {
        result = await client.callTool({
          name: "create_plan_template",
          arguments: {
            title: "Login Issue",
            type: "bug-fix",
            featureBranch: "fix-login",
          },
        });
      });

      it("generates the plan file with correct naming", async () => {
        const branchDir = join(PLANS_DIRECTORY, "fix-login");
        const files = await readdir(branchDir);

        expect(files).toHaveLength(1);
        expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_bug-fix\.md$/);
      });

      it("includes the bug-fix header", async () => {
        const branchDir = join(PLANS_DIRECTORY, "fix-login");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("# Fix Login Issue Bug");
      });

      it("includes the feature branch", async () => {
        const branchDir = join(PLANS_DIRECTORY, "fix-login");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("Feature branch: `fix-login`");
      });

      it("returns a resource link", async () => {
        expect(result.content).toEqual([
          expect.objectContaining({
            type: "resource_link",
            mimeType: "text/markdown",
            description: "Generated bug-fix plan template file",
            name: expect.stringMatching(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_bug-fix\.md$/),
            uri: expect.stringMatching(
              /^file:\/\/\/.*\/fix-login\/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_bug-fix\.md$/,
            ),
          }),
        ]);
      });
    });

    describe("with a Sentry issue URL", () => {
      beforeEach(async () => {
        await client.callTool({
          name: "create_plan_template",
          arguments: {
            title: "Memory Leak",
            type: "bug-fix",
            featureBranch: "fix-memory-leak",
            sentryIssueUrl: "https://sentry.io/issues/12345",
          },
        });
      });

      it("includes the Sentry URL in the content", async () => {
        const branchDir = join(PLANS_DIRECTORY, "fix-memory-leak");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("Sentry Issue: https://sentry.io/issues/12345");
      });
    });

    describe("with a Linear issue ID", () => {
      beforeEach(async () => {
        await client.callTool({
          name: "create_plan_template",
          arguments: {
            title: "Performance Bug",
            type: "bug-fix",
            featureBranch: "fix-performance",
            linearIssueId: "GHI-789",
          },
        });
      });

      it("includes the Linear issue ID in the content", async () => {
        const branchDir = join(PLANS_DIRECTORY, "fix-performance");
        const files = await readdir(branchDir);
        const content = await readFile(join(branchDir, files[0]), "utf-8");

        expect(content).toContain("Linear Issue ID: `GHI-789`");
      });
    });
  });
});
