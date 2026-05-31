export type GitHubIssue = {
  number?: number;
  title?: string;
  html_url?: string;
  pull_request?: unknown;
};

export type GitHubPull = {
  number?: number;
  title?: string;
  html_url?: string;
  merged_at?: string | null;
  state?: string;
  user?: {
    login?: string;
  } | null;
};

export type GitHubCommit = {
  sha?: string;
  html_url?: string;
  author?: {
    login?: string;
  } | null;
  commit?: {
    message?: string;
    author?: {
      date?: string | null;
    } | null;
  };
};

export type DuplicateIssue = {
  issue1: string;
  issue2: string;
  reason: string;
  issue1Number?: number;
  issue2Number?: number;
  similarity?: number;
};

export type PriorityIssue = {
  number: number;
  title: string;
  reason: string;
  urgency?: string;
  impact?: string;
  severity?: string;
  maintainability?: string;
};

export type RepoData = {
  issues?: GitHubIssue[];
  pulls?: GitHubPull[];
  commits?: GitHubCommit[];
  error?: string;
};
