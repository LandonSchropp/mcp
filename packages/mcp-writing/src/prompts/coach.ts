import { WEAKNESSES_STYLE_GUIDE } from "../env.ts";
import { removeFrontmatter } from "../markdown.ts";
import { createPromptMessageFromTemplate } from "../message.ts";
import { server } from "../server.ts";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "coach",
  {
    description:
      "Provide direct, actionable writing feedback to transform competent writing into memorable content",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target content to provide feedback on (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    let weaknessesGuide = removeFrontmatter(await Bun.file(WEAKNESSES_STYLE_GUIDE).text());

    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/coach.md"),
          target,
          { content: weaknessesGuide },
        ),
      ],
    };
  },
);
