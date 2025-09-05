function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable $${name} is required but not set`);
  }

  return value;
}

export const FORMATTING_STYLE_GUIDE = requireEnvironmentVariable("FORMATTING_STYLE_GUIDE");
export const LANGUAGE_STYLE_GUIDE = requireEnvironmentVariable("LANGUAGE_STYLE_GUIDE");
