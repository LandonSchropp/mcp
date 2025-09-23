import { renderTemplate, renderTemplateFile } from "../src/template.ts";
import { describe, it, expect, beforeEach } from "vitest";

describe("renderTemplate", () => {
  describe("when the template is empty", () => {
    it("returns empty string", () => {
      const template = "";
      const replacements = {};
      const result = renderTemplate(template, undefined, replacements);

      expect(result).toBe("");
    });
  });

  describe("when the template has placeholders with no whitespace", () => {
    it("replaces the placeholders", () => {
      const template = "Hello {{name}}, welcome to {{place}}!";
      const replacements = { name: "John", place: "the party" };
      const result = renderTemplate(template, undefined, replacements);

      expect(result).toBe("Hello John, welcome to the party!");
    });
  });

  describe("when the template has placeholders with spaces", () => {
    it("replaces the placeholders", () => {
      const template = "Hello {{ name }}, welcome to {{ place }}!";
      const replacements = { name: "John", place: "the party" };
      const result = renderTemplate(template, undefined, replacements);

      expect(result).toBe("Hello John, welcome to the party!");
    });
  });

  describe("when the template has multiple occurrences of the same variable", () => {
    it("replaces the placeholders", () => {
      const template = "{{name}} likes {{name}}'s own {{item}}";
      const replacements = { name: "Alice", item: "book" };
      const result = renderTemplate(template, undefined, replacements);

      expect(result).toBe("Alice likes Alice's own book");
    });
  });

  describe("when template has no placeholders", () => {
    it("returns the original text", () => {
      const template = "No placeholders here";
      const replacements = {};
      const result = renderTemplate(template, undefined, replacements);

      expect(result).toBe("No placeholders here");
    });
  });

  describe("when the provided replacements contain keys not in the template", () => {
    it("throws an error", () => {
      const template = "Hello {{name}}!";
      const replacements = { name: "John", extra: "unused" };

      expect(() => renderTemplate(template, undefined, replacements)).toThrow(
        "The provided replacements contain a key not found in the template: extra",
      );
    });
  });

  describe("when the template contains placeholders not provided in the replacements", () => {
    it("throws an error", () => {
      const template = "Hello {{name}}, welcome to {{place}} at {{time}}!";
      const replacements = { name: "John" };

      expect(() => renderTemplate(template, undefined, replacements)).toThrow(
        "The template contains placeholders not present in the replacements: place, time",
      );
    });
  });

  describe("when template contains a target placeholder", () => {
    describe("when the target value is present", () => {
      it("replaces target with the target value", () => {
        const template = "Apply the following rules to {{target}}:";
        const replacements = {};
        const result = renderTemplate(template, "/path/to/file.txt", replacements);

        expect(result).toBe("Apply the following rules to /path/to/file.txt:");
      });

      it("works with other placeholders", () => {
        const template = "Apply {{action}} to {{target}} with {{content}}.";
        const replacements = { action: "formatting", content: "these rules" };
        const result = renderTemplate(template, "main.ts", replacements);

        expect(result).toBe("Apply formatting to main.ts with these rules.");
      });
    });

    describe("when the target value is an empty string", () => {
      it("uses 'the current context'", () => {
        const template = "Apply the following rules to {{target}}:";
        const replacements = {};
        const result = renderTemplate(template, "", replacements);

        expect(result).toBe("Apply the following rules to the current context:");
      });
    });

    describe("when the target value is not provided", () => {
      it("uses 'the current context'", () => {
        const template = "Apply the following rules to {{target}}:";
        const replacements = {};
        const result = renderTemplate(template, undefined, replacements);

        expect(result).toBe("Apply the following rules to the current context:");
      });
    });
  });

  describe("when template does not contain a target placeholder", () => {
    describe("when the target value is present", () => {
      it("throws error for unused target key", () => {
        const template = "Hello {{name}}!";
        const replacements = { name: "World" };

        expect(() => renderTemplate(template, "file.txt", replacements)).toThrow(
          "The provided replacements contain a key not found in the template: target",
        );
      });
    });

    describe("when the target value is an empty string", () => {
      it("throws error for unused target key", () => {
        const template = "Hello {{name}}!";
        const replacements = { name: "World" };

        expect(() => renderTemplate(template, "", replacements)).toThrow(
          "The provided replacements contain a key not found in the template: target",
        );
      });
    });

    describe("when the target value is not provided", () => {
      it("works normally with other placeholders", () => {
        const template = "Hello {{name}}!";
        const replacements = { name: "World" };
        const result = renderTemplate(template, undefined, replacements);

        expect(result).toBe("Hello World!");
      });
    });
  });
});

const TEMPLATE_PATH = "/tmp/test-template.md";

describe("renderTemplateFile", () => {
  it("reads and renders a template file", async () => {
    await Bun.write(TEMPLATE_PATH, "Hello {{name}}!");

    const replacements = { name: "World" };
    const result = await renderTemplateFile(TEMPLATE_PATH, undefined, replacements);

    expect(result).toBe("Hello World!");
  });
});
