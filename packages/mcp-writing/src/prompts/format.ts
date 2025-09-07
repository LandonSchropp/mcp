import { FORMATTING_STYLE_GUIDE } from "../env.ts";
import { removeFrontmatter } from "../markdown.ts";
import { server } from "../server.ts";
import { z } from "zod";

server.registerPrompt(
  "format",
  {
    title: "Format",
    description: "Apply structure and formatting conventions to writing",
    argsSchema: { filePath: z.string() },
  },
  async ({ filePath }) => {
    let styleGuide = removeFrontmatter(await Bun.file(FORMATTING_STYLE_GUIDE).text());

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Apply the following formatting rules to ${filePath}\n\n${styleGuide}`,
          },
        },
      ],
    };
  },
);
