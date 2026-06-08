import type {
  DuplicateIssue,
  GitHubIssue,
  GitHubPull,
  PriorityIssue,
  RepoData,
} from "@/types/types";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

function extractJsonArray<T>(text: string) {
  const jsonMatch = text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    return [];
  }

  return JSON.parse(jsonMatch[0]) as T[];
}

export async function summarizeRepo(repoData: RepoData) {

  const issues = repoData.issues?.map((issue) => issue.title).filter(Boolean);
  const pulls = repoData.pulls?.map((pull) => ({
    title: pull.title,
    merged_at: pull.merged_at,
    state: pull.state,
  }));
  const commits = repoData.commits?.map((commit) => ({
    message: commit.commit?.message,
    date: commit.commit?.author?.date,
  }));

  const prompt = `
Generate a concise weekly repository activity summary.

Open issue titles:
${JSON.stringify(issues)}

Pull Requests:
${JSON.stringify(pulls)}

Commits:
${JSON.stringify(commits)}

Provide:
- Main themes
- Priorities
- Risks
- Suggested next actions
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text ?? "";
}

export async function generateWeeklyMaintainerReport({
  repo,
  repoData,
  healthScore,
}: {
  repo: string;
  repoData: RepoData;
  healthScore: number;
}) {

  const compactData = {
    repo,
    healthScore,
    issues: repoData.issues?.map((issue) => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
    })),
    pulls: repoData.pulls?.map((pull) => ({
      number: pull.number,
      title: pull.title,
      merged_at: pull.merged_at,
      state: pull.state,
      author: pull.user?.login,
    })),
    commits: repoData.commits?.map((commit) => ({
      sha: commit.sha,
      author: commit.author?.login,
      message: commit.commit?.message,
      date: commit.commit?.author?.date,
    })),
  };

  const prompt = `
You are a senior open source maintainer.

Generate a weekly maintainer report.

Include:
- repository health
- key accomplishments
- risks
- contributors to watch
- recommended actions

Return markdown in this structure:

# Weekly Maintainer Report

## Health
${healthScore}/100

## Wins

## Risks

## Contributors to Watch

## Recommended Actions

Repository activity:
${JSON.stringify(compactData)}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text ?? "";
}

export async function prioritizeIssues(issues: GitHubIssue[]) {

  if (issues.length === 0) {
    return [];
  }

  const issueInputs = issues.map((issue) => ({
    number: issue.number,
    title: issue.title,
  }));

  const prompt = `
Analyze these GitHub issues.
Rank them by:
- impact
- severity
- urgency

Return the top 5 only as valid JSON in this exact shape:
[
  {
    "number": 1532,
    "title": "Authentication fails after OAuth callback",
    "reason": "Affects all new users.",
    "impact": "high",
    "severity": "high",
    "urgency": "high"
  }
]

Issue titles:
${JSON.stringify(issueInputs)}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return extractJsonArray<PriorityIssue>(response.text ?? "");
}

export async function findDuplicateIssues(issues: GitHubIssue[]) {

  if (issues.length < 2) {
    return [];
  }

  const issueInputs = issues.map((issue) => ({
    number: issue.number,
    title: issue.title,
  }));

  const prompt = `
Given these issue titles, find duplicates or near duplicates.
Return only valid JSON in this exact shape:
[
  {
    "issue1Number": 145,
    "issue1": "Hydration mismatch on navigation",
    "issue2Number": 182,
    "issue2": "Hydration mismatch after route change",
    "similarity": 92,
    "reason": "Both report hydration mismatch."
  }
]

Issues:
${JSON.stringify(issueInputs)}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return extractJsonArray<DuplicateIssue>(response.text ?? "");
}

export async function generateReleaseNotes(pulls: GitHubPull[]) {

  const mergedPulls = pulls
    .filter((pull) => Boolean(pull.merged_at))
    .map((pull) => ({
      title: pull.title,
      number: pull.number,
      author: pull.user?.login,
      url: pull.html_url,
    }));

  const prompt = `
Generate release notes from these merged pull requests.
Render markdown grouped by:
- Features
- Fixes
- Docs

If a group has no items, write "No notable changes."

Merged pull requests:
${JSON.stringify(mergedPulls)}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text ?? "";
}

export async function askRepository(repoData: RepoData, question: string) {

  const compactData = {
    issues: repoData.issues?.map((issue) => ({
      number: issue.number,
      title: issue.title,
    })),
    pulls: repoData.pulls?.map((pull) => ({
      number: pull.number,
      title: pull.title,
      merged_at: pull.merged_at,
      state: pull.state,
      author: pull.user?.login,
    })),
    commits: repoData.commits?.map((commit) => ({
      sha: commit.sha,
      author: commit.author?.login,
      message: commit.commit?.message,
      date: commit.commit?.author?.date,
    })),
  };

  const prompt = `
You are OSS First Mate, an assistant helping maintainers understand repository activity.
Answer the user's question using only this fetched GitHub data.
Be concise, practical, and mention uncertainty when the data is insufficient.

Question:
${question}

Repository data:
${JSON.stringify(compactData)}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text ?? "";
}
