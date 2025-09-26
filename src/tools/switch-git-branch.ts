import {
  isWorkingDirectoryClean,
  doesBranchExist,
  switchBranch,
  createBranch,
} from "../commands/git";
import { server } from "../server-instance";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

server.registerTool(
  "switch-git-branch",
  {
    title: "switch-git-branch",
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

    return {
      content: [
        {
          type: "resource_link",
          uri: `git://feature-branch/${branch}`,
          name: branch,
          mimeType: "text/markdown",
          description: `The branch that was switched to`,
        },
      ],
    };
  },
);
