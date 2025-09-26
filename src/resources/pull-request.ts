import { getBranches } from "../commands/git";
import { getPullRequest } from "../commands/github";
import { server } from "../server-instance";
import { first } from "../utilities/array";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

server.registerResource(
  "pull-request",
  new ResourceTemplate(`github://pull-request/{+branch}`, {
    list: undefined,
    complete: {
      async branch(partial) {
        return (await getBranches()).filter((branch) => branch.startsWith(partial));
      },
    },
  }),
  {
    title: "pull-request",
    description: "Returns the details of a GitHub pull request for a branch",
  },
  async (uri, parameters) => {
    const branch = first(parameters.branch);
    const pullRequest = await getPullRequest(branch);

    if (!pullRequest) {
      throw new McpError(ErrorCode.InvalidRequest, `No pull request found for branch: ${branch}`, {
        uri,
      });
    }

    return {
      contents: [
        {
          uri: `github://pull-request/${branch}`,
          mimeType: "application/json",
          text: JSON.stringify(pullRequest),
        },
      ],
    };
  },
);
