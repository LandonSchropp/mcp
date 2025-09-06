import { server } from "../src/server.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mock } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Creates a fully connected MCP client for integration testing. This helper sets up:
 *
 * - The MCP server with all handlers registered
 * - In-memory transport for fast, isolated testing
 * - A connected client ready for testing
 *
 * @returns A connected MCP client for testing
 */
export async function createTestClient(): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({
    name: "test-client",
    version: "0.0.0",
  });

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return client;
}

/**
 * Mocks the env.ts module with a temporary style guide file.
 *
 * @param environmentVariable The environment variable name to mock
 * @param content The content to write to the temporary style guide file
 */
export async function mockStyleGuide(environmentVariable: string, content: string): Promise<void> {
  const styleGuidePath = join(tmpdir(), `env-var-name-${Date.now()}.md`);
  await Bun.write(styleGuidePath, content);

  mock.module("../src/env.ts", () => ({
    [environmentVariable]: styleGuidePath,
  }));
}
