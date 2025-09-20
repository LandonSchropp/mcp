# Test Failures Plan

## Overview

<!-- Write a brief description of the failing tests and the approach to fix them systematically. -->

## Context

<!-- Summarize the recent changes that may have caused the failures. -->

## Tests

<!-- List the failing tests provided in the arguments as a numbered list, ordered by abstraction level (lowest to highest). Output only the test file paths with numbers—no subsections or abstraction labels. Fixing lower-level tests may resolve higher-level test failures. -->

1. test/path/to/unit_test.js
2. test/path/to/integration_test.js
3. test/path/to/end_to_end_test.js

## Process

<!-- Copy this Process section exactly as written, without modification: -->

For each failing test above (in order) do the following:

1. Run the test command to confirm the test is actually failing.
2. Analyze the failure output to identify the root cause of the problem.
3. Fix the underlying issue.
4. Re-run the test to verify the fix resolves the failure.
5. If you make 5 attempts and the test is still failing, stop working and escalate to the user.

Once you've completed fixing all tests, for each fix, explain what was failing, what the underlying problem was, and how you fixed it.
