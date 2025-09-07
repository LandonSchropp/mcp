# MCP Servers

This is my personal collection of Model Context Protocol (MCP) servers.

## Servers

- **[Writing MCP Server](packages/mcp-writing)** - An MCP server that provides writing assistance tools and commands.

## Architecture

This project is a [Bun](https://bun.sh) monorepo with packages organized under `packages/`. Each package is an independent MCP server that can be run directly using Bun's built-in TypeScript support. It uses Bun as both the package manager and runtime, with workspaces handling dependency management across all packages. Since Bun has native TypeScript support, there's no build step required—you can run TypeScript files directly.

Type checking is handled by a single shared `tsconfig.json` that validates types across all packages in the monorepo.

## Development

The servers all come with a few standard commands:

- `bun check-types`: Run TypeScript type checking.
- `bun inspector`: Run the MCP inspector for the server.
- `bun start`: Start the server locally.
- `bun test`: Run the tests for the server.

You can connect any server to Claude directly during local development. For example, to connect the writing server:

```bash
claude mcp add <server-name> bun --cwd <path-to-server>
```

Note: The packages are not yet published, so you cannot run them with `bunx`.
