import { doesBranchExist, getBaseBranch, getDiff } from "../commands/git.js";
import { server } from "../server-instance.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

const EMPTY_DIFF = { commits: [], diff: "" };

// NOTE: This is implemented as a tool instead of a resource for a few key reasons:
//
// - Dynamic invocation: The base branch may need to be determined mid-workflow (e.g., after asking
//   the user), which requires model-controlled invocation. Most agents cannot dynamically read
//   resources.
// - The tool provides a more complex input schema, allowing for more nuanced arguments.
// - Tools are not automatically exposed with @ references, preventing Claude Code's references from
//   being clogged up.
server.registerTool(
  "fetch_feature_branch",
  {
    title: "fetch_feature_branch",
    description: "Returns the details of a feature branch",
    inputSchema: {
      branch: z.string().describe("The feature branch name"),
    },
  },
  async ({ branch }) => {
    if (!(await doesBranchExist(branch))) {
      throw new McpError(ErrorCode.InvalidParams, `Branch not found: ${branch}`);
    }

    const baseBranch = await getBaseBranch(branch);
    const diff = (await getDiff(baseBranch, branch)) ?? EMPTY_DIFF;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              branch,
              baseBranch,
              ...diff,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);
