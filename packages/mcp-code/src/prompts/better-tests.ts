import { isJavaScriptProject } from "../project.ts";
import { server } from "../server.ts";
import { removeFrontmatter } from "@landonschropp/mcp-shared/markdown";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

if (isJavaScriptProject()) {
  server.registerPrompt(
    "better-tests",
    {
      description: "Apply Better Specs conventions to JavaScript/TypeScript test code",
      argsSchema: {
        target: z
          .string()
          .optional()
          .describe("Target to format (file path, description, or reference)"),
      },
    },
    async ({ target }) => {
      let content = removeFrontmatter(
        await Bun.file(join(import.meta.dir, "../../docs/better-tests.md")).text(),
      );

      return {
        messages: [
          await createPromptMessageFromTemplate(
            join(import.meta.dir, "../../templates/better-tests.md"),
            target,
            { content },
          ),
        ],
      };
    },
  );
}
