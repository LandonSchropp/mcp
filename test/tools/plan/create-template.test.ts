import { createTestClient } from "../../helpers";
import { describe, it, expect, mock, beforeEach, afterEach } from "vitest";
import { mkdir, rm, readFile, readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

let PLANS_DIRECTORY = join(tmpdir(), `plans-${Date.now()}`);

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
    expectedHeader: "User Authentication Implementation Plan",
  },
  {
    type: "refactor",
    title: "Database Layer",
    featureBranch: "db-refactor",
    expectedHeader: "Database Layer Refactor",
  },
  {
    type: "spec-failures",
    title: "Fix Broken Specs",
    featureBranch: "fix-specs",
    expectedHeader: "Spec Failures Plan",
  },
  {
    type: "test-failures",
    title: "Fix Broken Tests",
    featureBranch: "fix-tests",
    expectedHeader: "Test Failures Plan",
  },
];

describe("tools/plan/create-template", () => {
  let client: Awaited<ReturnType<typeof createTestClient>>;

  beforeEach(async () => {
    // Create temp directory for plans
    await mkdir(PLANS_DIRECTORY, { recursive: true });

    // Mock the environment module
    mock.module("../../../src/env.ts", () => ({
      PLANS_DIRECTORY: PLANS_DIRECTORY,
      WRITING_FORMAT: "/tmp/format.md",
      WRITING_VOICE: "/tmp/voice.md",
      WRITING_IMPROVEMENT: "/tmp/improvement.md",
    }));

    // Import the server after mocking
    const { server } = await import("../../../src/server");
    client = await createTestClient(server);
  });

  afterEach(async () => await rm(PLANS_DIRECTORY, { recursive: true, force: true }));

  it("registers the tool", async () => {
    const { tools } = await client.listTools();

    expect(tools).toContainEqual(
      expect.objectContaining({
        name: "plan/create-template",
        description: "Creates an plan template",
      }),
    );
  });

  TEMPLATE_TEST_CASES.forEach(({ type, title, featureBranch, expectedHeader }) => {
    describe(`when the type is '${type}'`, () => {
      let result: any;

      beforeEach(async () => {
        result = await client.callTool({
          name: "plan/create-template",
          arguments: {
            title,
            type,
            featureBranch,
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
