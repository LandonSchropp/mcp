import { extractResourceURIs } from "./uri.js";
import { describe, it, expect } from "vitest";

describe("extractResourceURIs", () => {
  describe("when template has no URIs", () => {
    it("returns an empty set", () => {
      const template = "This is a plain text template";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set());
    });
  });

  describe("when template has a single URI", () => {
    it("returns the URI", () => {
      const template = "Check out file:///path/to/file.txt for details";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["file:///path/to/file.txt"]));
    });
  });

  describe("when template has multiple URIs", () => {
    it("returns all unique URIs", () => {
      const template = `
        - file:///first.txt
        - file:///second.txt
        - doc://example.com/file
      `;

      const result = extractResourceURIs(template);
      expect(result).toEqual(
        new Set(["file:///first.txt", "file:///second.txt", "doc://example.com/file"]),
      );
    });
  });

  // TODO: We currently don't have a partial that contains URIs. When one is added, this test case
  // can be implemented.
  describe("when template includes a partial", () => {
    it.skip("extracts URIs from both the template and the partial", () => {});
  });

  describe("when template contains HTTP URIs", () => {
    it("excludes HTTP URIs", () => {
      const template = "Valid: file:///local.txt Invalid: http://example.com/file.txt";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["file:///local.txt"]));
    });
  });

  describe("when template contains HTTPS URIs", () => {
    it("excludes HTTPS URIs", () => {
      const template = "Valid: file:///local.txt Invalid: https://example.com/file.txt";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["file:///local.txt"]));
    });
  });

  describe("when the URI is preceded by @", () => {
    it("excludes the @ from the extracted URI", () => {
      const template = "Check out @file:///path/to/file.txt for details";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["file:///path/to/file.txt"]));
    });
  });

  describe("when the URI has a trailing period", () => {
    it("excludes the period", () => {
      const template = "Check out @doc://writing/format.";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["doc://writing/format"]));
    });
  });

  describe("when the URI has a trailing exclamation mark", () => {
    it("excludes the exclamation mark", () => {
      const template = "Don't forget @doc://writing/format!";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["doc://writing/format"]));
    });
  });

  describe("when the URI has a trailing question mark", () => {
    it("excludes the question mark", () => {
      const template = "Should I check @doc://writing/format?";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["doc://writing/format"]));
    });
  });

  describe("when the URI is at text end without punctuation", () => {
    it("includes the URI", () => {
      const template = "Check @doc://writing/format";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["doc://writing/format"]));
    });
  });

  describe("when the template has multiple URIs with different punctuation", () => {
    it("excludes punctuation from all URIs", () => {
      const template = "See @doc://writing/format. Also check @doc://writing/voice!";
      const result = extractResourceURIs(template);
      expect(result).toEqual(new Set(["doc://writing/format", "doc://writing/voice"]));
    });
  });
});
