import { server } from "../server.ts";
import { getDefaultBranch, getDiff } from "@landonschropp/mcp-shared/git";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

server.registerResource(
  "branch",
  new ResourceTemplate("context://branch/{branch}", { list: undefined }),
  {
    title: "Branch",
    description: "The diff and commits for a branch compared with default branch",
  },
  async (uri, { branch }) => {
    const defaultBranch = await getDefaultBranch();
    const branchName = Array.isArray(branch) ? branch[0] : branch;

    const diff = await getDiff(defaultBranch, branchName);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(diff, null, 2),
        },
      ],
    };
  },
);
