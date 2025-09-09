import { FORMAT_STYLE_GUIDE } from "../env.ts";
import { server } from "../server.ts";
import { removeFrontmatter } from "@landonschropp/mcp-shared/markdown";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
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
    let content = removeFrontmatter(await Bun.file(FORMAT_STYLE_GUIDE).text());

    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/format.md"),
          target,
          { content },
        ),
      ],
    };
  },
);
