import type {
  DuplicateIssue,
  GitHubIssue,
  GitHubPull,
  PriorityIssue,
  RepoData,
} from "@/types/types";

/**
 * Validates GitHub API response data
 */
export function validateGitHubRepoData(data: unknown): RepoData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid repository data: expected object');
  }

  const repoData = data as Partial<RepoData>;

  // Validate issues array if present
  if (repoData.issues !== undefined) {
    if (!Array.isArray(repoData.issues)) {
      throw new Error('Invalid issues data: expected array');
    }
    repoData.issues.forEach(validateGitHubIssue);
  }

  // Validate pulls array if present
  if (repoData.pulls !== undefined) {
    if (!Array.isArray(repoData.pulls)) {
      throw new Error('Invalid pulls data: expected array');
    }
    repoData.pulls.forEach(validateGitHubPull);
  }

  // Validate commits array if present
  if (repoData.commits !== undefined) {
    if (!Array.isArray(repoData.commits)) {
      throw new Error('Invalid commits data: expected array');
    }
  }

  return repoData as RepoData;
}

/**
 * Validates a single GitHub issue
 */
function validateGitHubIssue(issue: unknown): asserts issue is GitHubIssue {
  if (!issue || typeof issue !== 'object') {
    throw new Error('Invalid issue: expected object');
  }

  const issueObj = issue as Partial<GitHubIssue>;

  if (issueObj.number !== undefined && typeof issueObj.number !== 'number') {
    throw new Error('Invalid issue: number must be a number');
  }

  if (issueObj.title !== undefined && typeof issueObj.title !== 'string') {
    throw new Error('Invalid issue: title must be a string');
  }

  if (issueObj.html_url !== undefined && typeof issueObj.html_url !== 'string') {
    throw new Error('Invalid issue: html_url must be a string');
  }
}

/**
 * Validates a single GitHub pull request
 */
function validateGitHubPull(pull: unknown): asserts pull is GitHubPull {
  if (!pull || typeof pull !== 'object') {
    throw new Error('Invalid pull request: expected object');
  }

  const pullObj = pull as Partial<GitHubPull>;

  if (pullObj.number !== undefined && typeof pullObj.number !== 'number') {
    throw new Error('Invalid pull request: number must be a number');
  }

  if (pullObj.title !== undefined && typeof pullObj.title !== 'string') {
    throw new Error('Invalid pull request: title must be a string');
  }

  if (pullObj.html_url !== undefined && typeof pullObj.html_url !== 'string') {
    throw new Error('Invalid pull request: html_url must be a string');
  }

  if (pullObj.merged_at !== undefined && typeof pullObj.merged_at !== 'string' && pullObj.merged_at !== null) {
    throw new Error('Invalid pull request: merged_at must be a string or null');
  }

  if (pullObj.state !== undefined && typeof pullObj.state !== 'string') {
    throw new Error('Invalid pull request: state must be a string');
  }
}

/**
 * Validates priority issues response
 */
export function validatePriorityIssues(data: unknown): PriorityIssue[] {
  if (!Array.isArray(data)) {
    throw new Error('Invalid priority issues: expected array');
  }

  data.forEach((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid priority issue: expected object');
    }

    const priorityIssue = item as Partial<PriorityIssue>;

    if (typeof priorityIssue.number !== 'number') {
      throw new Error('Invalid priority issue: number must be a number');
    }

    if (typeof priorityIssue.title !== 'string') {
      throw new Error('Invalid priority issue: title must be a string');
    }

    if (typeof priorityIssue.reason !== 'string') {
      throw new Error('Invalid priority issue: reason must be a string');
    }
  });

  return data as PriorityIssue[];
}

/**
 * Validates duplicate issues response
 */
export function validateDuplicateIssues(data: unknown): DuplicateIssue[] {
  if (!Array.isArray(data)) {
    throw new Error('Invalid duplicate issues: expected array');
  }

  data.forEach((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid duplicate issue: expected object');
    }

    const duplicateIssue = item as Partial<DuplicateIssue>;

    if (typeof duplicateIssue.issue1 !== 'string') {
      throw new Error('Invalid duplicate issue: issue1 must be a string');
    }

    if (typeof duplicateIssue.issue2 !== 'string') {
      throw new Error('Invalid duplicate issue: issue2 must be a string');
    }

    if (typeof duplicateIssue.reason !== 'string') {
      throw new Error('Invalid duplicate issue: reason must be a string');
    }
  });

  return data as DuplicateIssue[];
}

/**
 * Validates AI response (text)
 */
export function validateAIResponse(data: unknown): string {
  if (typeof data !== 'string') {
    throw new Error('Invalid AI response: expected string');
  }

  if (data.length === 0) {
    throw new Error('Invalid AI response: empty string');
  }

  if (data.length > 100000) {
    throw new Error('Invalid AI response: too long');
  }

  return data;
}
