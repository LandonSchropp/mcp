import { server } from "../server.ts";
import { getBranchResourceResult } from "./branch.ts";
import { getCurrentBranch } from "@landonschropp/mcp-shared/git";

server.registerResource(
  "current-branch",
  "context://branch",
  {
    title: "Current Branch",
    description: "The diff and commits for the current branch compared with the default branch",
  },
  async (uri) => {
    const currentBranch = await getCurrentBranch();
    return getBranchResourceResult(uri.href, currentBranch);
  },
);
