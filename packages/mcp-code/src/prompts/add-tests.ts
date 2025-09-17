import { isJavaScriptProject } from "../project.ts";
import { server } from "../server.ts";
import { removeFrontmatter } from "@landonschropp/mcp-shared/markdown";
import { createPromptMessageFromTemplate } from "@landonschropp/mcp-shared/message";
import { join } from "path";
import { z } from "zod";

if (isJavaScriptProject()) {
  server.registerPrompt(
    "add-tests",
    {
      description: "Add tests using a structured testing approach",
      argsSchema: {
        target: z
          .string()
          .optional()
          .describe("Target to add tests for (file path, description, or reference)"),
      },
    },
    async ({ target }) => {
      let content = removeFrontmatter(
        await Bun.file(join(import.meta.dir, "../../documentation/better-tests.md")).text(),
      );

      return {
        messages: [
          await createPromptMessageFromTemplate(
            join(import.meta.dir, "../../templates/add-tests.md"),
            target,
            { content },
          ),
        ],
      };
    },
  );
}
