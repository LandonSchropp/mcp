import { join } from "path";

/** The directory where documentation files are stored */
export const DOCUMENTS_DIRECTORY = join(import.meta.dirname, "../doc");

/** The name of the main branch */
export const MAIN_BRANCH = "main";

/** The name of the master branch */
export const MASTER_BRANCH = "master";

/** Common default branch names in priority order */
export const DEFAULT_BRANCH_NAMES = [MAIN_BRANCH, MASTER_BRANCH];
