import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** The configured MCP code server with all handlers registered. */
export const server = new McpServer({
  name: "Code",
  version: "0.0.0",
});

// Prompt imports
await import("./prompts/better-specs.ts");
await import("./prompts/better-tests.ts");
await import("./prompts/add-specs.ts");
await import("./prompts/add-tests.ts");
