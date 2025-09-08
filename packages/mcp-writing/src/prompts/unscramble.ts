import { FORMAT_STYLE_GUIDE } from "../env.ts";
import { server } from "../server.ts";
import { removeFrontmatter } from "@landonschropp/mcp-shared/markdown";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "unscramble",
  {
    description: "Reorganize and clarify the structure of writing",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target to reorganize (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    let styleGuide = removeFrontmatter(await Bun.file(FORMAT_STYLE_GUIDE).text());

    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/unscramble.md"),
          target,
          { content: styleGuide },
        ),
      ],
    };
  },
);
