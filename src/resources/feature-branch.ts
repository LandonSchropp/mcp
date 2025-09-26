import { doesBranchExist, getBaseBranch, getBranches, getDiff } from "../commands/git";
import { server } from "../server-instance";
import { first } from "../utilities/array";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const EMPTY_DIFF = { commits: [], diff: "" };

server.registerResource(
  "feature-branch",
  new ResourceTemplate(`git://feature-branch/{+branch}`, {
    list: undefined,
    complete: {
      async branch(partial) {
        return (await getBranches()).filter((branch) => branch.startsWith(partial));
      },
    },
  }),
  {
    title: "feature-branch",
    description: "Returns the details of a feature branch",
  },
  async (uri, parameters) => {
    const branch = first(parameters.branch);

    if (!(await doesBranchExist(branch))) {
      throw new McpError(ErrorCode.InvalidParams, `Branch not found: ${branch}`, { uri });
    }

    const baseBranch = await getBaseBranch(branch);
    const diff = (await getDiff(baseBranch, branch)) ?? EMPTY_DIFF;

    return {
      contents: [
        {
          uri: `git://feature-branch/${branch}`,
          mimeType: "application/json",
          text: JSON.stringify({
            branch,
            baseBranch,
            ...diff,
          }),
        },
      ],
    };
  },
);
