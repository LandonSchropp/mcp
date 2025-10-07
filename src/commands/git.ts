import { assertInstalled } from "./assertions.js";
import spawn, { SubprocessError } from "nano-spawn";

export interface GitCommit {
  sha: string;
  title: string;
}

export interface GitDiff {
  commits: GitCommit[];
  diff: string;
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
 * Get the diff between two commits or branches, including the list of commits and the diff itself.
 * This is equivalent to the diff produced with `git diff from..to` and `git log from..to`. This
 * means 'from' is excluded (non-inclusive) and 'to' is included (inclusive).
 *
 * @example This returns all commits on `feature` that aren't on `main`, plus their cumulative diff.
 *
 * ```typescript
 * await getDiff("main", "feature");
 * ```
 *
 * @param from The starting commit/branch reference (excluded from results).
 * @param to The ending commit/branch reference (included in results).
 * @returns An object containing the commits between the references and the diff, or null if no
 *   commits exist.
 */
export async function getDiff(from: string, to: string): Promise<GitDiff | null> {
  // Check if both branches exist
  if (!(await doesBranchExist(from)) || !(await doesBranchExist(to))) {
    return null;
  }

  // Get the list of commits between the two references
  const log = (await spawn("git", ["log", `${from}..${to}`, "--format=%h %s"])).stdout.trim();

  // Ensure there are commits to process
  if (!log) {
    return null;
  }

  // Parse the commits
  const commits: GitCommit[] = log.split("\n").map((line) => {
    const [, sha, title] = line.match(/^(\w+) (.+)$/)!;
    return { sha, title };
  });

  // Get the diff between the two references
  const diff = (await spawn("git", ["diff", `${from}..${to}`])).stdout.trim();

  return {
    commits,
    diff: diff.trim(),
  };
}

/** @returns The name of the default branch. */
export async function getDefaultBranch(): Promise<string> {
  // TODO: This uses my custom default-branch command, which will only work with my dotfiles. If I'd
  // like for this to be usable by others, I need to fully implement a default branch detection
  // mechanism here.
  return (await spawn("git", ["default-branch"])).stdout.trim();
}

/**
 * @param branch The branch to get the base branch for.
 * @returns The name of the base branch for the given branch.
 */
export async function getBaseBranch(_branch: string): Promise<string> {
  // TODO: For now, this just delegates to getDefaultBranch. It should be expanded to truly capture
  // the base branch of the current branch when a PR exists.
  return getDefaultBranch();
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
 * Check if a git branch exists.
 *
 * @param branch The branch name to check.
 * @returns True if the branch exists, false otherwise.
 */
export async function doesBranchExist(branch: string): Promise<boolean> {
  try {
    await spawn("git", ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]);
    return true;
  } catch (error) {
    if (error instanceof SubprocessError && error.exitCode !== 0) {
      return false;
    }
    throw error;
  }
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
 */
export async function createBranch(branch: string): Promise<void> {
  await spawn("git", ["switch", "-c", branch]);
}
