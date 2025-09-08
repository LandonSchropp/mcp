import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Creates a fully connected MCP client for integration testing. This helper sets up:
 *
 * - The MCP server with all handlers registered
 * - In-memory transport for fast, isolated testing
 * - A connected client ready for testing
 *
 * @param server The MCP server instance to connect
 * @returns A connected MCP client for testing
 */
export async function createTestClient(server: McpServer): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({
    name: "test-client",
    version: "0.0.0",
  });

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return client;
}
