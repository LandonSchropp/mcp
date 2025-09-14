import type { JSONValue } from "./types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";

export interface RegisterPromptOptions<TSchema extends z.ZodRawShape> {
  /** The MCP server instance to register the prompt on */
  server: McpServer;

  /** Unique identifier for the prompt */
  name: string;

  /** Human-readable description of what the prompt does */
  description: string;

  /** Optional Zod schema object defining the prompt's parameters */
  parameters?: TSchema;

  /**
   * Optional async predicate to conditionally register the prompt. If omitted, the prompt is always
   * registered.
   */
  enabled?: () => Promise<boolean>;

  /** Async function that returns the prompt content as a string */
  handler: (args: z.infer<z.ZodObject<TSchema>>) => Promise<string>;
}

export interface RegisterResourceOptions {
  /** The MCP server instance to register the resource on */
  server: McpServer;

  /**
   * The URI for the resource. Can be static (e.g., "config://settings") or a template with
   * parameters (e.g., "file:///{path}")
   */
  uri: string;

  /** Unique identifier for the resource */
  name: string;

  /** Human-readable description of what the resource provides */
  description: string;

  /**
   * Optional async predicate to conditionally register the resource. If omitted, the resource is
   * always registered.
   */
  enabled?: () => Promise<boolean>;

  /** Async function that returns the resource data as a valid JSON value */
  handler: (uri: string) => Promise<JSONValue>;
}

/**
 * Registers a prompt with the MCP server using a simplified API.
 *
 * This is a convenience wrapper around the standard MCP SDK that simplifies the common case of
 * returning text content. The handler returns a plain string which is automatically wrapped as a
 * text/plain message in the MCP protocol format.
 *
 * @param options - Options for registering the prompt
 */
export function registerPrompt<TSchema extends z.ZodRawShape = {}>(
  options: RegisterPromptOptions<TSchema>,
): void {
  // Implementation will be added later
  throw new Error("Not implemented yet");
}

/**
 * Registers a resource with the MCP server using a simplified API.
 *
 * This is a convenience wrapper around the standard MCP SDK that simplifies the common case of
 * returning JSON data. The handler returns a JSON value which is automatically stringified and
 * served with application/json MIME type in the MCP protocol format.
 *
 * @param options - Options for registering the resource
 */
export function registerResource(options: RegisterResourceOptions): void {
  // Implementation will be added later
  // Will detect if uri contains {param} patterns and handle accordingly
  // Will JSON.stringify the returned object
  throw new Error("Not implemented yet");
}
