import { FORMAT_STYLE_GUIDE } from "../env.ts";
import { server } from "../server.ts";
import { removeFrontmatter, extractSection } from "@landonschropp/mcp-shared/markdown";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

server.registerPrompt(
  "lists",
  {
    description: "Apply list formatting conventions to writing",
    argsSchema: {
      target: z
        .string()
        .optional()
        .describe("Target to format (file path, description, or reference)"),
    },
  },
  async ({ target }) => {
    let styleGuide = removeFrontmatter(await Bun.file(FORMAT_STYLE_GUIDE).text());
    let listsSection = extractSection(styleGuide, "Lists");

    if (!listsSection) {
      throw new Error("Lists section not found in style guide");
    }

    return {
      messages: [
        await createPromptMessageFromTemplate(
          join(import.meta.dir, "../../templates/format.md"),
          target,
          { content: listsSection },
        ),
      ],
    };
  },
);
