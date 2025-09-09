import { isRubyProject } from "../project.ts";
import { server } from "../server.ts";
import { removeFrontmatter } from "@landonschropp/mcp-shared/markdown";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

if (isRubyProject()) {
  server.registerPrompt(
    "add-specs",
    {
      description: "Add specs using a structured testing approach",
      argsSchema: {
        target: z
          .string()
          .optional()
          .describe("Target to add specs for (file path, description, or reference)"),
      },
    },
    async ({ target }) => {
      let content = removeFrontmatter(
        await Bun.file(join(import.meta.dir, "../../docs/better-specs.md")).text(),
      );

      return {
        messages: [
          await createPromptMessageFromTemplate(
            join(import.meta.dir, "../../templates/add-specs.md"),
            target,
            { content },
          ),
        ],
      };
    },
  );
}
