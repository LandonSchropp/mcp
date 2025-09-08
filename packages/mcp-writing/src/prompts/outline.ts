import { createPromptMessageFromTemplate } from "../message.ts";
import { server } from "../server.ts";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "outline",
  {
    description: "Generate a detailed outline from content",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target content to outline (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/outline.md"),
          target,
          {},
        ),
      ],
    };
  },
);
