import { FORMAT_STYLE_GUIDE } from "../env.ts";
import { removeFrontmatter } from "../markdown.ts";
import { createFormatPromptMessage } from "../message.ts";
import { server } from "../server.ts";
import { z } from "zod";

server.registerPrompt(
  "format",
  {
    description: "Apply structure and formatting conventions to writing",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target to format (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    let styleGuide = removeFrontmatter(await Bun.file(FORMAT_STYLE_GUIDE).text());

    return {
      messages: [createFormatPromptMessage(target, styleGuide)],
    };
  },
);
