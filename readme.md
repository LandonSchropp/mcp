# MCP Servers

This is my personal collection of Model Context Protocol (MCP) servers.

## Servers

- **[Writing MCP Server](packages/mcp-writing)** - An MCP server that provides writing assistance tools and commands.

## Development Notes

This is a [Bun](https://bun.sh) monorepo with packages organized under `packages/`. Each package is an independent MCP server that can be run directly using Bun's built-in TypeScript support.

This project uses Bun as both the package manager and runtime, with workspaces handling dependency management across all packages. Since Bun has native TypeScript support, there's no build step required—you can run TypeScript files directly.

Type checking is handled by a single shared `tsconfig.json` that validates types across all packages in the monorepo.
