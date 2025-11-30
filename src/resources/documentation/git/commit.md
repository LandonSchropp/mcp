---
title: Commit Guidelines
description: Guidelines for writing clear, concise git commit messages
---

## Commit Message Title

Create a clear, succinct commit message title that explains what the commit accomplishes. Keep it brief - only the essentials.

Good examples:

- Add user authentication
- Fix memory leak in parser
- Update dependencies
- Remove deprecated API endpoints
- Refactor database queries

Avoid:

- Overly detailed titles
- Implementation details that belong in the body
- Redundant phrases like "This commit..." or "Changes to..."

## Commit Message Body

Only add a commit body if the title alone can't capture what the commit does. Most commits should only have a title. DON'T ADD A BODY UNLESS ABSOLUTELY NECESSARY. When a body is needed:

- Keep it brief - 1-2 sentences maximum
- Focus on the "why" if it's not obvious
- Use the imperative mood
