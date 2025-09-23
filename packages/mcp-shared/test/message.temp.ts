import { createTextMessage, createPromptMessageFromTemplate } from "../src/message.ts";
import { describe, it, expect } from "vitest";

describe("createTextMessage", () => {
  it("creates a text message with user role", () => {
    const text = "Hello, world!";
    const result = createTextMessage(text);

    expect(result).toEqual({
      role: "user",
      content: {
        type: "text",
        text: "Hello, world!",
      },
    });
  });
});

describe("createPromptMessageFromTemplate", () => {
  const TEMPLATE_PATH = "/tmp/test-message-template.md";

  it("creates a prompt message from template", async () => {
    await Bun.write(TEMPLATE_PATH, "Hello {{content}} to {{target}}!");

    const result = await createPromptMessageFromTemplate(TEMPLATE_PATH, "world", {
      content: "welcome",
    });

    expect(result.role).toBe("user");
    expect(result.content.type).toBe("text");
    expect(result.content.text).toBe("Hello welcome to world!");
  });
});
