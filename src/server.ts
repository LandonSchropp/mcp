import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** The unified MCP server with all prompts auto-registered. */
export const server = new McpServer({
  name: "Landon's Personal MCP Server",
  version: "0.0.0",
});

// TODO: Add prompt auto-registration
