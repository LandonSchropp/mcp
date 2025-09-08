import { VOICE_STYLE_GUIDE } from "../env.ts";
import { removeFrontmatter } from "../markdown.ts";
import { createPromptMessageFromTemplate } from "../message.ts";
import { server } from "../server.ts";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "voice",
  {
    description: "Apply voice and tone guidelines to writing",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target to apply voice guidelines to (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    let styleGuide = removeFrontmatter(await Bun.file(VOICE_STYLE_GUIDE).text());

    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/format.md"),
          target,
          { content: styleGuide },
        ),
      ],
    };
  },
);
