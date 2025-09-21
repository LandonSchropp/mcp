import { assertInstalled } from "./assertions";
import spawn from "nano-spawn";

/**
 * Asserts that Claude Code is installed by checking its version.
 *
 * @throws If Claude Code is not installed.
 */
export async function assertClaudeInstalled() {
  await assertInstalled("Claude Code", "claude", ["--version"]);
}

/**
 * Launches a Claude Code subagent to run a command returns the result.
 *
 * @param command The command to run.
 * @returns The result of the command.
 */
export async function claude(command: string): Promise<string> {
  return (await spawn("claude", ["--print", command])).stdout.trim();
}
