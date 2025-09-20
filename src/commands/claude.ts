import { assertInstalled } from "./assertions";

/**
 * Asserts that Claude Code is installed by checking its version.
 *
 * @throws If Claude Code is not installed.
 */
export function assertClaudeInstalled() {
  assertInstalled("Claude Code", "claude", ["--version"]);
}
