import { templateScopeMatchesCurrentProject } from "../../src/templates/scope";
import { isProjectType } from "../../src/utilities/project";
import { writeFile, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { dedent } from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockIsProjectType: Mock<typeof isProjectType> = vi.hoisted(() => vi.fn());

vi.mock("../../src/utilities/project", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    isProjectType: mockIsProjectType,
  };
});

describe("templateScopeMatchesCurrentProject", () => {
  let testFilePath: string;

  beforeEach(async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "test-"));
    testFilePath = join(tempDirectory, "test-scope.md");
  });

  describe("when the file has no scope in the frontmatter", () => {
    it("returns true", async () => {
      await writeFile(
        testFilePath,
        dedent`
          ---
          title: Test Title
          description: Test description
          ---
          
          Test Content
        `,
      );

      expect(mockIsProjectType).not.toHaveBeenCalled();
      expect(await templateScopeMatchesCurrentProject(testFilePath)).toBe(true);
    });
  });

  describe("when the file's scope matches the current project", () => {
    it("returns true", async () => {
      mockIsProjectType.mockResolvedValue(true);

      await writeFile(
        testFilePath,
        dedent`
          ---
          title: Test Title
          description: Test description
          scope: typescript
          ---
          
          Test Content
        `,
      );

      const result = await templateScopeMatchesCurrentProject(testFilePath);

      expect(mockIsProjectType).toHaveBeenCalledWith("typescript");
      expect(result).toBe(true);
    });
  });

  describe("when the file's scope does not match the current project", () => {
    it("returns false", async () => {
      mockIsProjectType.mockResolvedValue(false);

      await writeFile(
        testFilePath,
        dedent`
          ---
          title: Test Title
          description: Test description
          scope: ruby
          ---
          
          Test Content
        `,
      );

      const result = await templateScopeMatchesCurrentProject(testFilePath);

      expect(mockIsProjectType).toHaveBeenCalledWith("ruby");
      expect(result).toBe(false);
    });
  });
});
