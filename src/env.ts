/**
 * Ensures that an environment variable has set.
 *
 * @param name The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws If the environment variable is not set.
 */
function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable $${name} is required but not set`);
  }

  return value;
}

/** The directory relative to the project's root where plan files are stored. */
export const PLANS_DIRECTORY = requireEnvironmentVariable("PLANS_DIRECTORY");

/** The path to a markdown file containing writing format guidelines. */
export const WRITING_FORMAT = requireEnvironmentVariable("WRITING_FORMAT");

/** The path to a markdown file containing writing voice guidelines. */
export const WRITING_VOICE = requireEnvironmentVariable("WRITING_VOICE");

/** The path to a markdown file containing writing improvement guidelines. */
export const WRITING_IMPROVEMENT = requireEnvironmentVariable("WRITING_IMPROVEMENT");
