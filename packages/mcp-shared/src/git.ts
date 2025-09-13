import spawn, { SubprocessError } from "nano-spawn";

interface GitCommit {
  sha: string;
  title: string;
}

interface GitDiff {
  commits: GitCommit[];
  diff: string;
}

interface PullRequest extends GitDiff {
  title: string;
  description: string;
}

/**
 * Asserts that a command-line tool is installed by checking its exit code.
 *
 * @param result The result of the exec command.
 * @param name The name of the tool for error messages.
 * @throws If the tool is not installed.
 */
async function assertInstalled(name: string, command: string, args: string[] = []): Promise<void> {
  try {
    await spawn(command, args);
  } catch (error) {
    if (error instanceof SubprocessError) {
      throw new Error(`${name} is not installed.`);
    }
  }
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
 * Asserts that the GitHub CLI is installed by checking its version.
 *
 * @throws If the GitHub CLI is not installed.
 */
export async function assertGitHubInstalled() {
  await assertInstalled("GitHub", "gh");
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
 * @returns An object containing the commits between the references and the diff.
 */
export async function getDiff(from: string, to: string): Promise<GitDiff> {
  // Get the list of commits between the two references
  const log = (await spawn("git", ["log", `${from}..${to}`, "--format=%h %s"])).stdout.trim();

  // Ensure there are commits to process
  if (!log) {
    return { commits: [], diff: "" };
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
 * Get pull request information including commits, diff, title, and description. Uses GitHub CLI to
 * fetch PR details and combines them with git diff information.
 *
 * @example Get PR information for PR #123 in org/repo.
 *
 * ```typescript
 * const pullRequest = await getPullRequest("org/repo", 123);
 * ```
 *
 * @param repo The repository in "owner/name" format.
 * @param prNumber The pull request number.
 * @returns An object containing PR details, commits, and diff.
 */
export async function getPullRequest(repo: string, prNumber: number): Promise<PullRequest> {
  const pullRequestData = JSON.parse(
    (
      await spawn("gh", [
        "pr",
        "view",
        prNumber.toString(),
        "--repo",
        repo,
        "--json",
        "title,body,commits",
      ])
    ).stdout,
  );

  const commits: GitCommit[] = pullRequestData.commits.map((commit: any) => ({
    sha: commit.oid.substring(0, 7),
    title: commit.messageHeadline,
  }));

  const diff = (
    await spawn("gh", ["pr", "diff", prNumber.toString(), "--repo", repo])
  ).stdout.trim();

  return {
    commits,
    diff,
    title: pullRequestData.title,
    description: pullRequestData.body,
  };
}
