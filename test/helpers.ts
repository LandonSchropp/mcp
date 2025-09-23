import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mock } from "vitest";
import { join } from "path";

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

/** A function that restores a mocked module to its original implementation. */
export type RestoreMockModule = () => void;

// The src directory path
const SOURCE_DIRECTORY = join(import.meta.dirname, "../src");

/**
 * This implementation mocks a module before each test and restores the original module after each
 * test. It's meant to be called outside of `it` blocks, typically in a `describe` block.
 *
 * This is a workaround for a bug with the built-in mock.module. See these two issues for more
 * details:
 *
 * - https://github.com/oven-sh/bun/issues/12823
 * - https://github.com/oven-sh/bun/issues/7823
 *
 * @param moduleSourcePath The path of the module to mock _relative to the src directory_.
 * @param createMocks The function that generates the mock implementations.
 * @returns A function that restores the original module implementation.
 */
export const mockModule = async (
  moduleSourcePath: string,
  renderMocks: () => Record<string, any>,
): Promise<RestoreMockModule> => {
  // Double check that a relative path was not provided.
  if (moduleSourcePath.startsWith(".")) {
    throw new Error(
      `The path should be relative to the src directory, not a relative path. Received '${moduleSourcePath}'`,
    );
  }

  // Determine the path of the module relative to this file.
  let modulePath = join("../src", moduleSourcePath);

  // Capture the original module implementation.
  let original = { ...(await import(modulePath)) };

  // Mock the module with bun's mock.module
  mock.module(moduleSourcePath, () => ({ ...original, ...renderMocks() }));

  // Return a function that restores the original module implementation by re-mocking it.
  return () => mock.module(moduleSourcePath, () => original);
};
