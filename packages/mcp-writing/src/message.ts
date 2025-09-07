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

export function createFormatPromptMessage(
  filePath: string | undefined,
  styleGuide: string,
): PromptMessage {
  let target = filePath ? ` to ${filePath}` : "";

  return createTextMessage(`Apply the following rules${target}:\n\n${styleGuide}`);
}
