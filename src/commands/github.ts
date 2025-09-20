import { assertInstalled } from "./assertions";
import { GitCommit, GitDiff } from "./git";
import spawn from "nano-spawn";

interface PullRequest extends GitDiff {
  title: string;
  description: string;
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
