import { join } from "path";

/** The directory where prompt files are stored */
export const PROMPTS_DIRECTORY = join(import.meta.dir, "../prompts");

/** The directory where documentation files are stored */
export const DOCUMENTS_DIRECTORY = join(import.meta.dir, "../doc");

/** The directory where templates are stored */
export const TEMPLATES_DIRECTORY = join(import.meta.dir, "../templates/");
