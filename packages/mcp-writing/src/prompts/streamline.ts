import { createPromptMessageFromTemplate } from "../message.ts";
import { server } from "../server.ts";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "streamline",
  {
    description: "Analyze content to identify and remove redundant, verbose, or low-value content",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target content to streamline (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/streamline.md"),
          target,
          {},
        ),
      ],
    };
  },
);
