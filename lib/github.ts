import type { GitHubCommit, GitHubIssue, GitHubPull, RepoData } from "@/types/types";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
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
      per_page: 50,
      state: "open",
    }),

    octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      per_page: 50,
      state: "all",
    }),

    octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
      per_page: 50,
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
