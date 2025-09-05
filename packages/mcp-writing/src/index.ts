#!/usr/bin/env node
import { registerFormat } from "./prompts/format";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "Writing",
  version: "0.0.0",
});

const transport = new StdioServerTransport();
await server.connect(transport);
