import { relativePathWithoutExtension } from "../../src/utilities/path.js";
import { describe, it, expect } from "vitest";

describe("relativePathWithoutExtension", () => {
  describe("when the path has a single extension", () => {
    it("removes the extension", () => {
      expect(relativePathWithoutExtension("/test", "/test/example/file.js")).toBe("example/file");
    });
  });

  describe("when the path has multiple extensions", () => {
    it("removes all extensions", () => {
      expect(relativePathWithoutExtension("/test", "/test/example/archive.tar.gz")).toBe(
        "example/archive",
      );
    });
  });

  describe("when the path has no extension", () => {
    it("returns the path unchanged", () => {
      expect(relativePathWithoutExtension("/test", "/test/example/README")).toBe("example/README");
    });
  });
});
