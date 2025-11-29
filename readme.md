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

## Installation

First, globally link the package.

```bash
pnpm link --global
```

Then configure Claude Code to run the server.

```bash
claude mcp add ls \
  --scope user \
  --env WRITING_FORMAT="$WRITING_FORMAT" \
  --env WRITING_VOICE="$WRITING_VOICE" \
  --env WRITING_IMPROVEMENT="$WRITING_IMPROVEMENT" \
  --env PLANS_DIRECTORY="$PLANS_DIRECTORY" \
  -- landon-schropp-mcp
```

## Environment

The server requires three environment variables that contain paths to markdown files. These aren't
included in the repository because they're meant to represent the unique writing style of the user.

- `WRITING_FORMAT`: Formatting conventions.
- `WRITING_VOICE`: Language and voice guidelines—how the writing should sound.
- `WRITING_IMPROVEMENT`: Coaching and improvement suggestions.

In addition, you'll need to provide a `PLANS_DIRECTORY` variable containing the relative path of a
directory to store plan files in.

## Architecture

This project is an MCP server that can be run directly using tsx for TypeScript execution. Since tsx
has native TypeScript support, there's no build step required—you can run TypeScript files directly.

### Organization

This repo is organized into several directories:

- `src`: The main source code for the server.
- `test`: Test files for the server.
- `prompts`: Markdown files that are converted into MCP server prompts.
- `docs`: Markdown files that are converted into MCP server resources.
- `templates`: Reusable markdown content. Templates don't generate any resources, tools, or prompts
  on the MCP server.

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

The MCP server comes with these commands:

- `pnpm build`: Build the TypeScript source to JavaScript.
- `pnpm check-types`: Run TypeScript type checking.
- `pnpm inspector`: Run the MCP inspector for the server.
- `pnpm start`: Start the server locally (uses tsx, no build required).
- `pnpm test`: Run the tests for the server.
