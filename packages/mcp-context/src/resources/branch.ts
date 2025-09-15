import { server } from "../server.ts";
import {
  getDefaultBranch,
  getDiff,
  getCurrentBranch,
  getBranches,
} from "@landonschropp/mcp-shared/git";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Helper function to get branch resource result
 *
 * @param uri The URI of the resource
 * @param branchName The name of the branch to get the diff for
 * @returns The resource result containing the diff and commits
 */
export async function getBranchResourceResult(uri: string, branchName: string) {
  const defaultBranch = await getDefaultBranch();
  const diff = await getDiff(defaultBranch, branchName);

  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(diff, null, 2),
      },
    ],
  };
}

server.registerResource(
  "branch",
  new ResourceTemplate("context://branch/{+branch}", {
    list: undefined,
    complete: {
      branch: async (value: string) => {
        return (await getBranches()).filter((branch) =>
          branch.toLowerCase().startsWith(value.toLowerCase()),
        );
      },
    },
  }),
  {
    title: "Branch",
    description: "The diff and commits for a branch compared with the default branch",
  },
  async (uri, { branch }) => {
    const branchName = Array.isArray(branch) ? branch[0] : branch;
    return getBranchResourceResult(uri.href, branchName);
  },
);
