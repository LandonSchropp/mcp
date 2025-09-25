import { server } from "../../../src/server";
import { createTestClient } from "../../helpers";
import { Client } from "@modelcontextprotocol/sdk/client";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockIsWorkingDirectoryClean = vi.hoisted(() => vi.fn());
const mockDoesBranchExist = vi.hoisted(() => vi.fn());
const mockSwitchBranch = vi.hoisted(() => vi.fn());
const mockCreateBranch = vi.hoisted(() => vi.fn());

vi.mock("../../../src/commands/git", () => ({
  isWorkingDirectoryClean: mockIsWorkingDirectoryClean,
  doesBranchExist: mockDoesBranchExist,
  switchBranch: mockSwitchBranch,
  createBranch: mockCreateBranch,
}));

// TODO: For some reason, Vitest is not resetting the mocks between tests, so we have to do it
// manually. This shouldn't be necessary.
beforeEach(() => {
  vi.resetAllMocks();

  mockIsWorkingDirectoryClean.mockResolvedValue(true);
  mockDoesBranchExist.mockResolvedValue(false);
  mockSwitchBranch.mockResolvedValue(undefined);
  mockCreateBranch.mockResolvedValue(undefined);
});

describe("tools/git/switch-branch", () => {
  let client: Client;

  beforeEach(async () => (client = await createTestClient(server)));

  it("registers the tool", async () => {
    const { tools } = await client.listTools();

    expect(tools).toContainEqual(
      expect.objectContaining({
        name: "git/switch-branch",
        description: "Creates the branch if it doesn't exist and switches to it",
      }),
    );
  });

  describe("when the working directory is not clean", () => {
    let result: any;

    beforeEach(async () => {
      mockIsWorkingDirectoryClean.mockResolvedValue(false);

      result = await client.callTool({
        name: "git/switch-branch",
        arguments: { branch: "dirty-branch" },
      });
    });

    it("returns an error", () => {
      expect(result.isError).toBe(true);
      expect(result.content).toEqual([
        expect.objectContaining({
          type: "text",
          text: expect.stringContaining("Working directory is not clean"),
        }),
      ]);
    });
  });

  describe("when the branch exists", () => {
    let result: any;

    beforeEach(async () => {
      mockDoesBranchExist.mockResolvedValue(true);

      result = await client.callTool({
        name: "git/switch-branch",
        arguments: { branch: "existing-branch" },
      });
    });

    it("calls switchBranch", () => {
      expect(mockSwitchBranch).toHaveBeenCalledWith("existing-branch");
    });

    it("does not call createBranch", () => {
      expect(mockCreateBranch).not.toHaveBeenCalled();
    });

    it("returns a resource link to the feature branch", () => {
      expect(result.content).toEqual([
        expect.objectContaining({
          type: "resource_link",
          uri: "git://feature-branch/existing-branch",
          name: "existing-branch",
          mimeType: "text/markdown",
          description: "The branch that was switched to",
        }),
      ]);
    });
  });

  describe("when the branch does not exist", () => {
    let result: any;

    beforeEach(async () => {
      mockDoesBranchExist.mockResolvedValue(false);

      result = await client.callTool({
        name: "git/switch-branch",
        arguments: { branch: "new-branch" },
      });
    });

    it("calls createBranch", () => {
      expect(mockCreateBranch).toHaveBeenCalledWith("new-branch");
    });

    it("does not call switchBranch", () => {
      expect(mockSwitchBranch).not.toHaveBeenCalled();
    });

    it("returns a resource link to the feature branch", async () => {
      expect(result.content).toEqual([
        expect.objectContaining({
          type: "resource_link",
          uri: "git://feature-branch/new-branch",
          name: "new-branch",
          mimeType: "text/markdown",
          description: "The branch that was switched to",
        }),
      ]);
    });
  });
});
