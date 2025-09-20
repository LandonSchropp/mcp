import spawn, { SubprocessError } from "nano-spawn";

/**
 * Asserts that a command-line tool is installed by checking its exit code.
 *
 * @param name The name of the tool for error messages.
 * @param command The command to check.
 * @param result Arguments that can be passed to the command to check if it's installed. The command
 *   combined with the arguments should exit with a 0 status when the command is installed.
 * @throws If the tool is not installed.
 */
export async function assertInstalled(
  name: string,
  command: string,
  args: string[] = [],
): Promise<void> {
  try {
    await spawn(command, args);
  } catch (error) {
    if (error instanceof SubprocessError) {
      throw new Error(`${name} is not installed.`);
    }
  }
}
