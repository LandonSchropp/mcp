import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** A registration function that registers handlers (tools, prompts, resources) on an MCP server. */
export type RegisterFunction = (server: McpServer) => void;

/**
 * Creates a fully connected MCP client for integration testing.
 *
 * This helper sets up:
 *
 * - An MCP server with full capabilities (prompts, tools, resources)
 * - In-memory transport for fast, isolated testing
 * - A connected client ready for testing
 *
 * @param registerFunctions Registration functions that register handlers on the server
 * @returns A connected MCP client for testing
 */
export async function createTestClient(...registerFunctions: RegisterFunction[]): Promise<Client> {
  const server = new McpServer({
    name: "test-writing-server",
    version: "0.0.0",
  });

  registerFunctions.forEach((registerFunction) => registerFunction(server));

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  });

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return client;
}
