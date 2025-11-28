---
title: Instructions
description: The process used by all plan commands
---

Your job is to create a {{planType}} implementation plan by breaking it down into manageable components and defining a systematic development approach.

1. If the scope of the {{planType}} is not clear from the prompt's arguments or the previous context, ask the user to: "Please describe the {{planType}}{{#if (eq planType "bug-fix")}} or provide a Linear issue ID, Linear issue URL, or Sentry issue URL{{else}} or provide a Linear issue ID or Linear issue URL{{/if}}." If the user responds with a Linear issue, fetch its details using the Linear MCP server.{{#if (eq planType "bug-fix")}} If the user provides a Sentry issue URL, store it for use in the plan template.{{/if}}

2. Determine the feature branch. If the user has provided a Linear issue, the branch specified in the issue will be the feature branch. {{#if (eq currentBranch defaultBranch)}}Otherwise, ask the user: "What feature branch would you like to use?"{{else}}Otherwise, ask the user: "Would you like to use `{{currentBranch}}` as the feature branch?"{{/if}}

3. If the current branch `{{currentBranch}}` is the feature branch, move on to step 4. Otherwise, ask the user, "Would you like to use `{{currentBranch}}` as the base branch?" Then call the `switch_git_branch` tool with the feature branch and the base branch.

4. Create a plan file using the `create_plan_template` tool. This will generate a pre-populated plan for you to fill out. Read the resulting file.

5. Fill out each section of the plan one at a time. Follow the instructions in the template for each section.
   - For the context section, fetch the current branch's changes by calling the `fetch_feature_branch` tool with the feature branch and the base branch (if you have it). If there are no changes on the feature branch, remove the Context section entirely.
   - For the Scope and Plan sections, research the {{planType}} and its implementation. Ask the user clarifying questions if needed to understand the task and what's required to implement it.
   - Do not modify sections that contain the comment "Copy this section exactly as written, without modification", but do delete the comment.

ultrathink
