import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { expect } from "vitest";

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

expect.extend({
  toHaveSameMembers(received: unknown, expected: unknown) {
    if (!Array.isArray(received) || !Array.isArray(expected)) {
      return {
        pass: false,
        message: () => "Expected both values to be arrays",
      };
    }

    let receivedSet = new Set(received);
    let expectedSet = new Set(expected);

    return {
      pass: receivedSet.size === expectedSet.size && receivedSet.isSubsetOf(expectedSet),
      message: () => {
        let diff = this.utils.printDiffOrStringify(receivedSet, expectedSet);
        return `Expected arrays to ${this.isNot ? "not " : ""}have the same members.\n\n${diff}`;
      },
    };
  },
});
