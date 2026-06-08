import type { GitHubCommit, GitHubIssue, GitHubPull, RepoData } from "@/types/types";
import { Octokit } from "octokit";
import { env } from "@/lib/env";

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
  request: {
    timeout: 30000, // 30 second timeout for GitHub API requests
  },
});

export async function getRepoData({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}): Promise<RepoData> {
  const [issues, pulls, commits] = await Promise.all([
    octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo,
      per_page: 200,
      state: "open",
    }),

    octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      per_page: 200,
      state: "all",
    }),

    octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
      per_page: 200,
    }),
  ]);

  return {
    issues: (issues.data as GitHubIssue[]).filter(
      (issue) => !issue.pull_request,
    ),
    pulls: pulls.data as GitHubPull[],
    commits: commits.data as GitHubCommit[],
  };
}
