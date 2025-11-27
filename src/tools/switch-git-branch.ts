import {
  isWorkingDirectoryClean,
  doesBranchExist,
  switchBranch,
  createBranch,
} from "../commands/git.js";
import { server } from "../server-instance.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

server.registerTool(
  "switch_git_branch",
  {
    title: "switch_git_branch",
    description: "Creates the branch if it doesn't exist and switches to it",
    inputSchema: {
      branch: z.string().describe("The branch name to switch to"),
    },
  },
  async ({ branch }) => {
    if (!(await isWorkingDirectoryClean())) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "Working directory is not clean. Please commit or stash your changes before switching branches.",
      );
    }

    if (await doesBranchExist(branch)) {
      await switchBranch(branch);
    } else {
      await createBranch(branch);
    }

    return { content: [] };
  },
);
