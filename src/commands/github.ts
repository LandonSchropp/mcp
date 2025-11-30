import { assertInstalled } from "./assertions.js";
import { GitCommit } from "./git.js";
import spawn, { SubprocessError } from "nano-spawn";

interface PullRequest {
  title: string;
  description: string;
  branch: string;
  baseBranch: string;
  commits: GitCommit[];
  diff: string;
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
 * Get pull request information including commits, diff, title, and description. Uses GitHub CLI to
 * fetch PR details and combines them with git diff information.
 *
 * @example Get PR information for a branch.
 *
 * ```typescript
 * const pullRequest = await getPullRequest("feature-branch");
 * ```
 *
 * @param branch The branch name for the pull request.
 * @returns An object containing PR details, commits, and diff, or null if no PR exists for the
 *   branch.
 */
export async function getPullRequest(branch: string): Promise<PullRequest | null> {
  try {
    const pullRequestData = JSON.parse(
      (await spawn("gh", ["pr", "view", branch, "--json", "title,body,commits,baseRefName"]))
        .stdout,
    );

    const commits: GitCommit[] = pullRequestData.commits.map((commit: any) => ({
      sha: commit.oid.substring(0, 7),
      title: commit.messageHeadline,
    }));

    const diff = (await spawn("gh", ["pr", "diff", branch])).stdout.trim();

    return {
      commits,
      diff,
      title: pullRequestData.title,
      description: pullRequestData.body,
      branch,
      baseBranch: pullRequestData.baseRefName,
    };
  } catch (error) {
    // Return null if no PR exists for the branch (GitHub CLI returns exit code 1)
    if (error instanceof SubprocessError && error.exitCode === 1) {
      return null;
    }
    // Re-throw other subprocess errors and all other errors
    throw error;
  }
}
