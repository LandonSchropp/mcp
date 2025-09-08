import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** The configured MCP writing server with all handlers registered. */
export const server = new McpServer({
  name: "Writing",
  version: "0.0.0",
});

await import("./prompts/coach.ts");
await import("./prompts/draft.ts");
await import("./prompts/format.ts");
await import("./prompts/headers.ts");
await import("./prompts/lists.ts");
await import("./prompts/outline.ts");
await import("./prompts/streamline.ts");
await import("./prompts/title.ts");
await import("./prompts/unscramble.ts");
await import("./prompts/voice.ts");
