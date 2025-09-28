import { join } from "path";

/** The directory where prompt files are stored */
export const PROMPTS_DIRECTORY = join(import.meta.dirname, "../prompts");

/** The directory where documentation files are stored */
export const DOCUMENTS_DIRECTORY = join(import.meta.dirname, "../doc");

/** The directory where templates are stored */
export const TEMPLATES_DIRECTORY = join(import.meta.dirname, "../templates/");

/** A Ruby project scope. */
export const RUBY_PROJECT_TYPE = "ruby";

/** A JavaScript/TypeScript project scope. */
export const TYPESCRIPT_PROJECT_TYPE = "typescript";

/** All supported project scopes. */
export const PROJECT_TYPES = [RUBY_PROJECT_TYPE, TYPESCRIPT_PROJECT_TYPE] as const;
