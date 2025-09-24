# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server using pnpm as the package manager and Node.js with tsx as the runtime. The project provides writing assistance tools through an MCP server that can be connected directly to Claude.

## Commands

- `pnpm check-types`: Run TypeScript type checking.
- `pnpm start`: Start the server locally.
- `pnpm test`: Run the tests for the server.
- `pnpm test <path>`: Run the tests for a specific file
- `pnpm prettier --write <path>`: Format a file.

## Architecture

### Project Structure

- **Single MCP Server**: All functionality in a single server at root level
- **TypeScript Config**: `tsconfig.json` at root validates the entire project
- **No Build Step**: tsx runs TypeScript directly - no compilation needed
- **Direct Execution**: `tsx src/index.ts` works without preprocessing

### MCP Server Pattern

The server follows this structure:

- `src/index.ts` - Entry point with stdio transport setup
- `src/server.ts` - MCP server configuration and prompt/tool registration
- `src/prompts/` - Individual prompt implementations
- `templates/` - Markdown template files for prompts
- `test/` - Test files mirroring src structure

### Server Architecture

The server uses:

- **Template-based prompts**: Each prompt loads a markdown template from `templates/`
- **Environment-dependent style guides**: Integrates external style guides via environment variables
- **Zod validation**: All prompt arguments validated with Zod schemas
- **Modular prompts**: Each prompt is a separate module exporting name, description, and getMessages

### Environment Variables

Configured in `mise.toml`:

- `WRITING_FORMAT`: Path to formatting guidelines document
- `WRITING_VOICE`: Path to voice/language guidelines document
- `WRITING_IMPROVEMENT`: Path to writing weaknesses coaching guide

These link to external documents in `/Users/landon/Notes/Areas/AI/Writing/`

## Testing Approach

- **Test Runner**: Vitest
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
