import { server } from "../server.ts";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "title",
  {
    description: "Generate compelling titles for content",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target to generate titles for (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/title.md"),
          target,
          {},
        ),
      ],
    };
  },
);
