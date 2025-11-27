import { createTestClient } from "../../test/helpers.js";
import {
  isWorkingDirectoryClean,
  doesBranchExist,
  switchBranch,
  createBranch,
} from "../commands/git.js";
import { server } from "../server.js";
import { Client } from "@modelcontextprotocol/sdk/client";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockIsWorkingDirectoryClean: Mock<typeof isWorkingDirectoryClean> = vi.hoisted(() => vi.fn());
const mockDoesBranchExist: Mock<typeof doesBranchExist> = vi.hoisted(() => vi.fn());
const mockSwitchBranch: Mock<typeof switchBranch> = vi.hoisted(() => vi.fn());
const mockCreateBranch: Mock<typeof createBranch> = vi.hoisted(() => vi.fn());

vi.mock("../commands/git", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    isWorkingDirectoryClean: mockIsWorkingDirectoryClean,
    doesBranchExist: mockDoesBranchExist,
    switchBranch: mockSwitchBranch,
    createBranch: mockCreateBranch,
  };
});

// TODO: For some reason, Vitest is not resetting the mocks between tests, so we have to do it
// manually. This shouldn't be necessary.
beforeEach(() => {
  vi.resetAllMocks();

  mockIsWorkingDirectoryClean.mockResolvedValue(true);
  mockDoesBranchExist.mockResolvedValue(false);
  mockSwitchBranch.mockResolvedValue(undefined);
  mockCreateBranch.mockResolvedValue(undefined);
});

describe("tools/switch_git_branch", () => {
  let client: Client;

  beforeEach(async () => (client = await createTestClient(server)));

  it("registers the tool", async () => {
    const { tools } = await client.listTools();

    expect(tools).toContainEqual(
      expect.objectContaining({
        name: "switch_git_branch",
        description: "Creates the branch if it doesn't exist and switches to it",
      }),
    );
  });

  describe("when the working directory is not clean", () => {
    let result: any;

    beforeEach(async () => {
      mockIsWorkingDirectoryClean.mockResolvedValue(false);

      result = await client.callTool({
        name: "switch_git_branch",
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
        name: "switch_git_branch",
        arguments: { branch: "existing-branch" },
      });
    });

    it("calls switchBranch", () => {
      expect(mockSwitchBranch).toHaveBeenCalledWith("existing-branch");
    });

    it("does not call createBranch", () => {
      expect(mockCreateBranch).not.toHaveBeenCalled();
    });

    it("returns no content", () => {
      expect(result.content).toEqual([]);
    });
  });

  describe("when the branch does not exist", () => {
    describe("when no base branch is provided", () => {
      let result: any;

      beforeEach(async () => {
        mockDoesBranchExist.mockResolvedValue(false);

        result = await client.callTool({
          name: "switch_git_branch",
          arguments: { branch: "new-branch" },
        });
      });

      it("calls createBranch without a base branch", () => {
        expect(mockCreateBranch).toHaveBeenCalledWith("new-branch", undefined);
      });

      it("does not call switchBranch", () => {
        expect(mockSwitchBranch).not.toHaveBeenCalled();
      });

      it("returns no content", async () => {
        expect(result.content).toEqual([]);
      });
    });

    describe("when a base branch is provided", () => {
      let result: any;

      beforeEach(async () => {
        mockDoesBranchExist.mockResolvedValue(false);

        result = await client.callTool({
          name: "switch_git_branch",
          arguments: { branch: "new-branch", baseBranch: "main" },
        });
      });

      it("calls createBranch with the base branch", () => {
        expect(mockCreateBranch).toHaveBeenCalledWith("new-branch", "main");
      });

      it("does not call switchBranch", () => {
        expect(mockSwitchBranch).not.toHaveBeenCalled();
      });

      it("returns no content", async () => {
        expect(result.content).toEqual([]);
      });
    });
  });
});
