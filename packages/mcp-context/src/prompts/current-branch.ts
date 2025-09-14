import { server } from "../server.ts";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";

server.registerPrompt(
  "current-branch",
  {
    description: "Get the diff and commits for the current branch compared with the default branch",
    argsSchema: {},
  },
  async () => {
    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/current-branch.md"),
          undefined,
          {},
        ),
      ],
    };
  },
);
