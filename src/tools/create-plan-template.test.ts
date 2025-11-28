import { createTestClient } from "../../test/helpers.js";
import { inferBaseBranch } from "../commands/git.js";
import { server } from "../server.js";
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

vi.mock("../env.ts", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    PLANS_DIRECTORY: PLANS_DIRECTORY,
  };
});

vi.mock("../commands/git.js", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    inferBaseBranch: mockInferBaseBranch,
  };
});

const TEMPLATE_TEST_CASES = [
  {
    type: "bug-fix",
    title: "Login Issue",
    featureBranch: "fix-login",
    expectedHeader: "Fix Login Issue",
  },
  {
    type: "feature",
    title: "User Authentication",
    featureBranch: "auth-feature",
    linearIssueId: "ABC-123",
    expectedHeader: "User Authentication Implementation Plan",
  },
  {
    type: "refactor",
    title: "Database Layer",
    featureBranch: "db-refactor",
    expectedHeader: "Database Layer Refactor",
  },
];

describe("tools/create_plan_template", () => {
  let client: Client;

  beforeEach(async () => {
    // Create temp directory for plans
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

  TEMPLATE_TEST_CASES.forEach(({ type, title, featureBranch, linearIssueId, expectedHeader }) => {
    describe(`when the type is '${type}'`, () => {
      let result: any;

      beforeEach(async () => {
        result = await client.callTool({
          name: "create_plan_template",
          arguments: {
            title,
            type,
            featureBranch,
            ...(linearIssueId && { linearIssueId }),
          },
        });
      });

      it("generates the plan file", async () => {
        const branchDir = join(PLANS_DIRECTORY, featureBranch);
        const files = await readdir(branchDir);

        expect(files).toHaveLength(1);
        expect(files[0]).toMatch(
          new RegExp(`^\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}_${type}\\.md$`),
        );
      });

      it("generate's the plan's content", async () => {
        const branchDir = join(PLANS_DIRECTORY, featureBranch);
        const files = await readdir(branchDir);
        const planFile = join(branchDir, files[0]);

        const content = await readFile(planFile, "utf-8");
        expect(content).toContain(`# ${expectedHeader}`);
      });

      it("returns a resource link to the plan file", async () => {
        expect(result.content).toEqual([
          expect.objectContaining({
            type: "resource_link",
            mimeType: "text/markdown",
            description: `Generated ${type} plan template file`,
            name: expect.stringMatching(
              new RegExp(`^\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}_${type}\\.md$`),
            ),
            uri: expect.stringMatching(
              new RegExp(
                `^file:\\/\\/\\/.*\\/${featureBranch}\\/\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}_${type}\\.md$`,
              ),
            ),
          }),
        ]);
      });
    });
  });
});
