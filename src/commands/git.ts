import { DEFAULT_BRANCH_NAMES, MAIN_BRANCH } from "../constants.js";
import { assertInstalled } from "./assertions.js";
import spawn, { SubprocessError } from "nano-spawn";

export interface GitCommit {
  sha: string;
  title: string;
}

/**
 * Asserts that Git is installed by checking its version.
 *
 * @throws If Git is not installed.
 */
export async function assertGitInstalled() {
  await assertInstalled("Git", "git", ["--version"]);
}

/**
 * Get the list of commits between two branches.
 *
 * Uses `git log from..to` (double-dot) to get commits reachable from `to` but not `from`. These are
 * the commits that would appear in a PR.
 *
 * @example This returns all commits on `feature` that aren't on `main`.
 *
 * ```typescript
 * await getCommits("main", "feature");
 * ```
 *
 * @param from The base branch reference (typically `main` or `master`, or in the case of a pull
 *   request `origin/main` or `origin/master`).
 * @param to The target branch reference (typically the feature branch).
 * @returns An array of commits, or null if either branch doesn't exist or there are no commits.
 */
export async function getCommits(from: string, to: string): Promise<GitCommit[] | null> {
  if (!(await doesBranchExist(from)) || !(await doesBranchExist(to))) {
    return null;
  }

  const log = (await spawn("git", ["log", `${from}..${to}`, "--format=%h %s"])).stdout.trim();

  if (!log) {
    return null;
  }

  return log.split("\n").map((line) => {
    const [, sha, title] = line.match(/^(\w+) (.+)$/)!;
    return { sha, title };
  });
}

/**
 * Get the diff between two branches.
 *
 * Uses `git diff from...to` (triple-dot) to get the diff from the merge base to `to`. This shows
 * the cumulative changes since the branches diverged, which is exactly what GitHub shows in a PR
 * diff view.
 *
 * @example This returns the cumulative diff of all changes on `feature` since it diverged from
 * `main`.
 *
 * ```typescript
 * await getDiff("main", "feature");
 * ```
 *
 * @param from The base branch reference (typically `main` or `master`, or in the case of a pull
 *   request `origin/main` or `origin/master`).
 * @param to The target branch reference (typically the feature branch).
 * @returns The diff as a string, or null if either branch doesn't exist.
 */
export async function getDiff(from: string, to: string): Promise<string | null> {
  if (!(await doesBranchExist(from)) || !(await doesBranchExist(to))) {
    return null;
  }

  return (await spawn("git", ["diff", `${from}...${to}`])).stdout.trim();
}

/**
 * Get the name of the default branch by checking for common default branch names.
 *
 * Checks for branches in this priority order: main, master.
 *
 * @returns The name of the default branch.
 */
export async function getDefaultBranch(): Promise<string> {
  const branches = await getBranches();
  return DEFAULT_BRANCH_NAMES.find((name) => branches.includes(name)) ?? MAIN_BRANCH;
}

/**
 * Determines the base branch for a given branch by analyzing commit ancestry.
 *
 * This uses `git log` to find the first commit that has other branch references, indicating where
 * the current branch diverged from its parent.
 *
 * @param branch The branch to get the base branch for.
 * @returns The name of the base branch for the given branch.
 */
export async function inferBaseBranch(branch: string): Promise<string> {
  const defaultBranch = await getDefaultBranch();

  // Only look at commits added since diverging from the default branch.
  let decorations = (await spawn("git", ["log", "--format=%D", `${defaultBranch}..${branch}`]))
    .stdout;

  // Parse the decorations to find branch names
  const branches = decorations
    .trim()
    .split(/\n+/g)
    .map((line) =>
      line
        .split(/\s*(?:,|->)\s*/)
        .filter((ref) => ref && ref !== branch && !/^(HEAD$|tag:|origin\/)/.test(ref)),
    )
    .filter((line) => line.length > 0)
    .flat();

  // Return the first branch found, or fall back to default branch
  return branches[0] ?? defaultBranch;
}

/**
 * Get the current Git branch.
 *
 * @returns The name of the current branch.
 */
export async function getCurrentBranch(): Promise<string> {
  return (await spawn("git", ["branch", "--show-current"])).stdout.trim();
}

/**
 * Get a list of all local Git branches.
 *
 * @returns An array of branch names.
 */
export async function getBranches(): Promise<string[]> {
  const branches = (await spawn("git", ["branch", "--format=%(refname:short)"])).stdout.trim();

  if (!branches) {
    return [];
  }

  return branches.split("\n").map((branch) => branch.trim());
}

/**
 * Check if the working directory is clean (no uncommitted changes).
 *
 * @returns True if the working directory is clean, false otherwise.
 */
export async function isWorkingDirectoryClean(): Promise<boolean> {
  return (await spawn("git", ["status", "--porcelain"])).stdout.trim() === "";
}

/**
 * Check if a git branch exists (either local or remote).
 *
 * @param branch The branch name to check (e.g., "main", "origin/main").
 * @returns True if the branch exists, false otherwise.
 */
export async function doesBranchExist(branch: string): Promise<boolean> {
  const refs = [`refs/heads/${branch}`, `refs/remotes/${branch}`];

  for (const ref of refs) {
    try {
      await spawn("git", ["show-ref", "--verify", "--quiet", ref]);
      return true;
    } catch (error) {
      if (error instanceof SubprocessError && error.exitCode !== 0) {
        continue;
      }
      throw error;
    }
  }

  return false;
}

/**
 * Switch to an existing git branch.
 *
 * @param branch The branch name to switch to.
 */
export async function switchBranch(branch: string): Promise<void> {
  await spawn("git", ["switch", branch]);
}

/**
 * Create a new git branch.
 *
 * @param branch The branch name to create.
 * @param baseBranch Optional base branch to create the new branch from.
 */
export async function createBranch(branch: string, baseBranch?: string): Promise<void> {
  await spawn("git", ["switch", "-c", branch, ...(baseBranch ? [baseBranch] : [])]);
}
