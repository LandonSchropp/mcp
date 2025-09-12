import spawn, { SubprocessError } from "nano-spawn";


/**
 * Asserts that a command-line tool is installed by checking its exit code.
 *
 * @param result The result of the exec command.
 * @param name The name of the tool for error messages.
 * @throws If the tool is not installed.
 */
async function assertInstalled(name: string, command: string, args: string[] = []): Promise<void> {
  try {
    await spawn(command, args);
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
