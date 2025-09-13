import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** The configured MCP context server with all handlers registered. */
export const server = new McpServer({
  name: "Context",
  version: "0.0.0",
});

await import("./resources/branch.ts");
