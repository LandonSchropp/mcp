import { server } from "../server.ts";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "branch",
  {
    description: "Get the diff and commits for a branch compared with the default branch",
    argsSchema: {
      branch: z.string().describe("The name of the branch to get the diff for"),
    },
  },
  async ({ branch }) => {
    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/branch.md"),
          undefined,
          { branch },
        ),
      ],
    };
  },
);
