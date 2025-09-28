---
title: Add Tests
description: Add tests using a structured testing approach
---

{{> parameters/_target action="add tests for"}}

Add tests for TARGET using the following process:

1. **Analyze current state:** Determine the appropriate test file location. If there's an existing test file, read it to understand the current structure.

2. **Plan test structure:** List describe and context blocks without wrapping in commands:

   ```
   #method_name
     when condition A
     when condition B
     when edge case C
   ```

3. **Review and approval:** Wait for feedback on proposed structure before implementation.

4. **Implement Incrementally:** Implement one context block at a time. Wait for approval after each context implementation. Run tests after each context addition. Fix failures before proceeding.

Follow the @doc://testing/better-tests guidelines.
