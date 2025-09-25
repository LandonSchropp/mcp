import { assertInstalled } from "./assertions";
import { GitCommit, GitDiff } from "./git";
import spawn, { SubprocessError } from "nano-spawn";

interface PullRequest extends GitDiff {
  title: string;
  description: string;
  branch: string;
  baseBranch: string;
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
 * @example Get PR information for a branch in org/repo.
 *
 * ```typescript
 * const pullRequest = await getPullRequest("org/repo", "feature-branch");
 * ```
 *
 * @param repo The repository in "owner/name" format.
 * @param branch The branch name for the pull request.
 * @returns An object containing PR details, commits, and diff, or null if no PR exists for the
 *   branch.
 */
export async function getPullRequest(repo: string, branch: string): Promise<PullRequest | null> {
  try {
    const pullRequestData = JSON.parse(
      (
        await spawn("gh", [
          "pr",
          "view",
          branch,
          "--repo",
          repo,
          "--json",
          "title,body,commits,baseRefName",
        ])
      ).stdout,
    );

    const commits: GitCommit[] = pullRequestData.commits.map((commit: any) => ({
      sha: commit.oid.substring(0, 7),
      title: commit.messageHeadline,
    }));

    const diff = (await spawn("gh", ["pr", "diff", branch, "--repo", repo])).stdout.trim();

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
