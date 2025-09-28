import { PROJECT_TYPES } from "../constants";
import { isProjectType } from "../utilities/project";
import { parseFrontmatter } from "./frontmatter";
import { readFile } from "fs/promises";
import z from "zod";

// Schema for validating frontmatter scope property
const FRONTMATTER_SCOPE_SCHEMA = z.object({
  scope: z.enum(PROJECT_TYPES).optional(),
});

/** Checks if the scope in the frontmatter matches the current project type */
export async function templateScopeMatchesCurrentProject(path: string): Promise<boolean> {
  let { frontmatter } = parseFrontmatter(await readFile(path, "utf8"), FRONTMATTER_SCOPE_SCHEMA);
  return !frontmatter.scope || (await isProjectType(frontmatter.scope));
}
