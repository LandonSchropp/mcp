# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) servers monorepo using Bun as both the runtime and package manager. The project provides writing assistance tools through MCP servers that can be connected directly to Claude.

## Commands

- `bun check-types`: Run TypeScript type checking.
- `bun start`: Start the server locally.
- `bun test`: Run the tests for the server.
- `bun test <path>`: Run the tests for a specific file
- `bun prettier --write <path>`: Format a file.

## Architecture

### Monorepo Structure

- **Bun Workspaces**: All packages under `packages/` directory
- **Shared TypeScript Config**: Single `tsconfig.json` at root validates all packages
- **No Build Step**: Bun runs TypeScript directly - no compilation needed
- **Direct Execution**: `bun run src/index.ts` works without preprocessing

### MCP Server Pattern

Each server follows this structure:

- `src/index.ts` - Entry point with stdio transport setup
- `src/server.ts` - MCP server configuration and prompt/tool registration
- `src/prompts/` - Individual prompt implementations
- `templates/` - Markdown template files for prompts
- `test/` - Test files mirroring src structure

### Writing Server Architecture

The writing server (`packages/mcp-writing`) uses:

- **Template-based prompts**: Each prompt loads a markdown template from `templates/`
- **Environment-dependent style guides**: Integrates external style guides via environment variables
- **Zod validation**: All prompt arguments validated with Zod schemas
- **Modular prompts**: Each prompt is a separate module exporting name, description, and getMessages

### Environment Variables

Configured in `mise.toml`:

- `FORMAT_STYLE_GUIDE`: Path to formatting guidelines document
- `VOICE_STYLE_GUIDE`: Path to voice/language guidelines document
- `IMPROVEMENT_STYLE_GUIDE`: Path to writing weaknesses coaching guide

These link to external documents in `/Users/landon/Notes/Areas/AI/Writing/`

## Testing Approach

- **Test Runner**: Bun's built-in test runner
- **Test Structure**: Mirror source structure with `.test.ts` suffix
- **Test Helpers**: Use `createTestClient()` from `test/helpers.ts` for MCP client setup
- **Test Pattern**: Each prompt tested for registration, argument handling, and content generation

## Key Implementation Notes

### Adding New Prompts

1. Create prompt module in `src/prompts/`
2. Add corresponding template in `templates/`
3. Import and register in `src/server.ts`
4. Add tests in `test/prompts/`

### MCP Server Implementation

- Use `@modelcontextprotocol/sdk` for server creation
- Implement stdio transport for Claude integration
- Register prompts with proper argument schemas
- Handle errors gracefully with try-catch blocks

### Code Quality

- Prettier configuration with import sorting and JSDoc plugins
- TypeScript strict mode enabled
- Consistent file naming: kebab-case for files, camelCase for exports
