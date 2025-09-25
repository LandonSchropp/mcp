import { getBaseBranch, getBranches, getDiff } from "../commands/git";
import { server } from "../server";
import { first } from "../utilities/array";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

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
  async (_uri, parameters) => {
    const branch = first(parameters.branch);
    const baseBranch = await getBaseBranch(branch);
    const diff = await getDiff(baseBranch, branch);

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
