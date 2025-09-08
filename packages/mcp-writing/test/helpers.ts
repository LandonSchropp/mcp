import { mock } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Mocks the env.ts module with a temporary style guide file.
 *
 * @param environmentVariable The environment variable name to mock
 * @param content The content to write to the temporary style guide file
 */
export async function mockStyleGuide(environmentVariable: string, content: string): Promise<void> {
  const styleGuidePath = join(tmpdir(), `env-var-name-${Date.now()}.md`);
  await Bun.write(styleGuidePath, content);

  mock.module("../src/env.ts", () => ({
    [environmentVariable]: styleGuidePath,
  }));
}
