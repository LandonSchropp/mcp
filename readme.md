# MCP Servers

This repo contains my personal Model Context Protocol (MCP) server, which is primarily composed of
custom prompts. The server is completely customized to my personal workflow, and isn't meant to be
used by anyone else, although others are welcome to use it if they'd like.

## Why Not Just Use Claude Code?

I _could_ implement prompts directly in tools like Claude Code, but using MCP servers has a few
advantages:

- The context for the prompts can be dynamically retrieved.
- I can easily change the prompt text to fit the specific circumstances.
- I can selectively exclude prompts that are not applicable to the current project.
- MCP servers can be called from a variety of agents, not just Claude Code.
- With MCP servers, I can run subagents in isolated contexts, preserving the main context window of the caller.

## Running the Server

You can connect the server to Claude Code directly when running the following command from this
project's root directory.

```bash
claude mcp add landon -- bun --cwd "$(pwd)" start
```

Note: The package is not yet published, so you cannot run it with `bunx`.

## Environment

The server requires three environment variables. All of these should contain the paths to markdown
files containing specific .

- `WRITING_FORMAT`: Formatting conventions.
- `WRITING_VOICE`: Language and voice guidelines—how the writing should sound.
- `WRITING_IMPROVEMENT`: Coaching and improvement suggestions.

## Architecture

This project is a [Bun](https://bun.sh) monorepo with packages organized under `packages/`. Each
package is an independent MCP server that can be run directly using Bun's built-in TypeScript
support. It uses Bun as both the package manager and runtime, with workspaces handling dependency
management across all packages. Since Bun has native TypeScript support, there's no build step
required—you can run TypeScript files directly.

### Resources

This server automatically loads all of the documentation inside the docs directory as resources. All
documentation resource URIs begin with `doc://`.

In addition, the `WRITING_` environment variables above are automatically registered as the
following resources:

- `doc://writing/format`
- `doc://writing/voice`
- `doc://writing/improvement`

### Prompts

Since most of this repository is dedicated to creating custom prompts, I've made that process as
easy as possible. Prompts are stored in the `prompts` directory, and the prompt is named after the
path of the file in the directory. The metadata for prompts is automatically pulled from the
frontmatter of the prompt files.

The prompts are Handlebars templates that are compiled into markdown. The system is smart enough to
recognize the [expressions](https://handlebarsjs.com/guide/expressions.html) present in each
template and automatically add them as arguments to the prompt in the MCP server.

### Expressions

Currently, the following expressions are supported:

- `{{ target }}`: The target the prompt should be applied to. If omitted, it will be inferred from
  the current context.
- `{{ branch }}`: The branch the prompt should be applied to, or the current branch if none is
  provided.

## Development

The MCP server comes with a commands:

- `bun check-types`: Run TypeScript type checking.
- `bun inspector`: Run the MCP inspector for the server.
- `bun start`: Start the server locally.
- `bun test`: Run the tests for the server.
