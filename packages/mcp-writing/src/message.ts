import { renderTemplateFile } from "./template.ts";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

/**
 * Creates a prompt text message for the given role and text content.
 *
 * @param text The text content of the message.
 * @returns A PromptMessage object with the specified role and text content.
 */
export function createTextMessage(text: string): PromptMessage {
  return {
    role: "user",
    content: {
      type: "text",
      text,
    },
  };
}

export async function createPromptMessageFromTemplate(
  templatePath: string,
  target: string | undefined,
  replacements: Record<string, string>,
): Promise<PromptMessage> {
  const renderedText = await renderTemplateFile(templatePath, target, replacements);
  return createTextMessage(renderedText);
}
