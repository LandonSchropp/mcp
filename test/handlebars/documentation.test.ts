import { handlebars } from "../../src/handlebars/index.ts";
import { describe, it, expect } from "bun:test";

describe.only("documentation helper", () => {
  it("is registered", () => {
    expect(handlebars.helpers).toHaveProperty("documentation");
  });

  describe("when no section is specified", () => {
    it("renders the path", () => {
      const template = handlebars.compile('{{documentation "writing/format"}}');
      const result = template({});

      expect(result).toBe("Documentation for writing/format#undefined");
    });
  });

  describe("when a section is specified", () => {
    it("renders the path with section", () => {
      const template = handlebars.compile('{{documentation "writing/format" section="lists"}}');
      const result = template({});

      expect(result).toBe("Documentation for writing/format#lists");
    });
  });

  describe("when multiple documentation helpers are used", () => {
    it("renders all documentation calls", () => {
      const template = handlebars.compile(`
        {{documentation "writing/format"}}
        {{documentation "code/better-specs" section="structure"}}
      `);
      const result = template({});

      expect(result).toContain("Documentation for writing/format#undefined");
      expect(result).toContain("Documentation for code/better-specs#structure");
    });
  });
});
