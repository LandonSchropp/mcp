import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** The configured MCP code server with all handlers registered. */
export const server = new McpServer({
  name: "Code",
  version: "0.0.0",
});

// Prompt imports will be added here as they are implemented
// Example:
// await import("./prompts/jest.ts");
// await import("./prompts/rspec.ts");
