export function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable $${name} is required but not set`);
  }

  return value;
}
