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

export const WRITING_FORMAT = requireEnvironmentVariable("WRITING_FORMAT");
export const WRITING_VOICE = requireEnvironmentVariable("WRITING_VOICE");
export const WRITING_IMPROVEMENT = requireEnvironmentVariable("WRITING_IMPROVEMENT");
