---
title: Create Commit
description: Create a git commit with an appropriate message based on staged changes
---

Create a git commit by analyzing the staged changes and generating a succinct commit message.

1. Run `git diff --staged` to see what changes are staged for commit. If there are no staged changes, stop and print a warning.

2. Analyze the changes and create a clear, succinct commit message title that explains what the commit accomplishes. Keep it brief - only the essentials.

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

3. Only add a commit body if the change is not clear from the title alone. Most commits should only have a title. When a body is needed:
   - Keep it brief - 1-2 sentences maximum
   - Focus on the "why" if it's not obvious
   - Use the imperative mood

4. Present the proposed commit message to the user for review. Display it clearly formatted and ask if they would like to proceed with creating the commit or make any changes.

5. After receiving user approval, execute the commit using a heredoc to ensure proper formatting:

   ```bash
   git commit -m "$(cat <<'EOF'
   <commit message here>
   EOF
   )"
   ```
