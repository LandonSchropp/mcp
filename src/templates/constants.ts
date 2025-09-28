/** A regex to match placeholders in Handlebars templates. */
export const PLACEHOLDER_REGEX = /\{\{\s*(\S+)\s*\}\}/g;

/** A regex to match URIs in Handlebars templates. */
export const URI_REGEX = /[^\s@]+:\/\/[^\s]*[\w-]/g;

/** A regex to match partials in Handlebars templates. */
export const PARTIAL_REGEX = /\{\{>\s*(\S+)((?:\s+[^=\s]+=[^=]+)*)\s*\}\}/g;

/** A regex to match parameters passed to a partial in Handlebars templates. */
export const PARTIAL_PARAMETER_REGEX = /\s+([^=\s]+)=[^=\s]+/g;
