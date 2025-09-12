import nanoSpawn, { SubprocessError } from "nano-spawn";

/**
 * This is a wrapper around nano-spawn. It works almost exactly the same, except if a
 *
 * @param command The command to run.
 * @param args The arguments to pass to the command.
 * @returns The result of the command.
 */
function spawn(command: string, args: string[] = []) {}

/**
 * Asserts that a command-line tool is installed by checking its exit code.
 *
 * @param result The result of the exec command.
 * @param name The name of the tool for error messages.
 * @throws If the tool is not installed.
 */
async function assertInstalled(name: string, command: string, args: string[] = []): Promise<void> {
  try {
    await nanoSpawn(command, args);
  } catch (error) {
    if (error instanceof SubprocessError) {
      throw new Error(`${name} is not installed.`);
    }
  }
}

/**
 * Asserts that Git is installed by checking its version.
 *
 * @throws If Git is not installed.
 */
export async function assertGitInstalled() {
  await assertInstalled("Git", "git", ["--version"]);
}

/**
 * Asserts that the GitHub CLI is installed by checking its version.
 *
 * @throws If the GitHub CLI is not installed.
 */
export async function assertGitHubInstalled() {
  await assertInstalled("GitHub", "gh");
}
