---
title: Create Pull Request
description: Create a pull request, automatically filling out the title and description
---

<!-- TODO: This can be converted into a tool once Claude Code supports sampling.-->

Create a pull request by analyzing the current branch's changes and generating an appropriate title and description based on the git diff.

1. Analyze the changes to the current feature branch by calling the `fetch_feature_branch` tool with branch `{{currentBranch}}`. If there are no changes, then stop.

2. If the current branch `{{currentBranch}}` begins with a linear issue ID (two or more letters, followed by a dash and then a number), fetch the Linear issue using the Linear MCP. You can use `git branch --show-current | grep -oE "^[A-Za-z]+-[0-9]+"` to extract the issue from the current branch.

3. Create a clear, descriptive title that explains what the PR accomplishes. Often, this will be a slightly reworked version of the Linear issue title (if applicable). If the task is a linear issue, prepend the PR title with square brackets followed containing the issue ID.

   Examples:
   - Add user profile management system
   - Update API documentation with examples
   - [IAM-12] Resolve authentication timeout issues
   - [AI-345] Simplify database connection logic
   - [ENG-78] Update build configuration and dependencies

4. Create concise descriptions that focus on the essential information. Keep descriptions brief and focused.
   - Check to see if a pull request template exists at @.github/pull_request_template.md.
     - If it does exist, use it.
       - If the PR contains a checklist, carefully review each item and determine if it was completed. If you're not sure, ask the user. Once done, remove the checklist section.
       - If the template contains merging instructions or other generic text, remove it.
       - If the template contains a screenshots/demo section, keep it but leave it empty.
     - If a template doesn't exist, create a simple description with Summary and Changes sections. Summary should contain a short paragraph explaining what the change is and why it's necessary. Changes should be a bulleted list of key modifications.
   - For simple changes, use a single paragraph summary and omit the rest.
   - Focus on what changed and why, not implementation details.
   - Use backticks for code terms, file names, and technical references.

5. Present the proposed PR title and body to the user for review. Display them clearly formatted and ask if they would like to proceed with creating the PR or make any changes.

6. After receiving user approval, push up the commits using `git push`. Then, execute `gh pr create --web --title "<title>" --body "<description>"`.
