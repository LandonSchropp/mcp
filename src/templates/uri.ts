import { URI_REGEX } from "./constants";

/**
 * Checks if a URI should be ignored (i.e., if it is HTTP or HTTPS).
 *
 * @param uri The URI to check
 * @returns True if the URI should be ignored, false otherwise
 */
function isIgnoredURI(uri: string): boolean {
  return uri.startsWith("http:") || uri.startsWith("https:");
}

/**
 * Extracts unique resource URIs from a template string. This function specifically does not handle
 * partials; it's intended to run on the fully rendered template.
 *
 * @param template The template string to analyze
 * @returns A set of unique resource URIs found in the template
 */
export function extractResourceURIs(template: string): Set<string> {
  return new Set(
    template
      .matchAll(URI_REGEX)
      .map(([uri]) => uri)
      .filter((uri) => !isIgnoredURI(uri)),
  );
}
