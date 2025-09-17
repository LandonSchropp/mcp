import { isRubyProject } from "../project.ts";
import { server } from "../server.ts";
import { removeFrontmatter } from "@landonschropp/mcp-shared/markdown";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

if (isRubyProject()) {
  server.registerPrompt(
    "better-specs",
    {
      description: "Apply Better Specs conventions",
      argsSchema: {
        target: z
          .string()
          .optional()
          .describe("Target to format (file path, description, or reference)"),
      },
    },
    async ({ target }) => {
      let content = removeFrontmatter(
        await Bun.file(join(import.meta.dir, "../../documentation/better-specs.md")).text(),
      );

      return {
        messages: [
          await createPromptMessageFromTemplate(
            join(import.meta.dir, "../../templates/better-specs.md"),
            target,
            { content },
          ),
        ],
      };
    },
  );
}
