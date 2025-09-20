# Spec Failures Plan

## Overview

<!-- Write a brief description of the failing specs and the approach to fix them systematically. -->

## Context

<!-- Summarize the recent changes that may have caused the failures. -->

## Specs

<!-- List the failing specs provided in the arguments as a numbered list, ordered by abstraction level (lowest to highest). Output only the spec file paths with numbers—no subsections or abstraction labels. Fixing lower-level specs may resolve higher-level spec failures. -->

1. spec/path/to/unit_spec.rb
2. spec/path/to/integration_spec.rb
3. spec/system/path/to/end_to_end_spec.rb

## Process

<!-- Copy this Process section exactly as written, without modification: -->

For each failing spec above (in order) do the following:

1. Run the spec command to confirm the spec is actually failing.
2. Analyze the failure output to identify the root cause of the problem.
3. Fix the underlying issue.
4. Re-run the spec to verify the fix resolves the failure.
5. If you make 5 attempts and the spec is still failing, stop working and escalate to the user.

Once you've completed fixing all specs, for each fix, explain what was failing, what the underlying problem was, and how you fixed it.
