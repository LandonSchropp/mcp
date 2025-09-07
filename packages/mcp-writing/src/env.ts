export function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable $${name} is required but not set`);
  }

  return value;
}

export const FORMAT_STYLE_GUIDE = requireEnvironmentVariable("FORMAT_STYLE_GUIDE");
export const VOICE_STYLE_GUIDE = requireEnvironmentVariable("VOICE_STYLE_GUIDE");
