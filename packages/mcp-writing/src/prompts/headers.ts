import { FORMATTING_STYLE_GUIDE } from "../env.ts";
import { removeFrontmatter, extractSection } from "../markdown.ts";
import { createFormatPromptMessage } from "../message.ts";
import { server } from "../server.ts";
import { z } from "zod";

server.registerPrompt(
  "headers",
  {
    description: "Apply header formatting conventions to writing",
    argsSchema: { filePath: z.string().optional() },
  },
  async ({ filePath }) => {
    let styleGuide = removeFrontmatter(await Bun.file(FORMATTING_STYLE_GUIDE).text());
    let headersSection = extractSection(styleGuide, "Headers");

    if (!headersSection) {
      throw new Error("Headers section not found in style guide");
    }

    return {
      messages: [createFormatPromptMessage(filePath, headersSection)],
    };
  },
);
