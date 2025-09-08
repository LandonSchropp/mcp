import { server } from "../server.ts";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "draft",
  {
    description: "Transform an outline into a fully developed document",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target outline to transform (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/draft.md"),
          target,
          {},
        ),
      ],
    };
  },
);
