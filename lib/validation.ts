/**
 * Input validation and sanitization utilities
 * Ensures user input is safe and properly formatted
 */

/**
 * Sanitizes a GitHub repository URL and extracts owner/repo
 */
export function validateAndParseRepoUrl(url: string): { owner: string; repo: string } {
  if (!url || typeof url !== 'string') {
    throw new Error('Repository URL is required and must be a string.');
  }

  const trimmedUrl = url.trim();

  // Basic URL format validation
  try {
    const parsedUrl = new URL(trimmedUrl);
    
    if (parsedUrl.hostname !== 'github.com') {
      throw new Error('URL must be from github.com');
    }

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL format');
    }

    const owner = pathParts[0];
    const repo = pathParts[1];

    // Validate owner and repo names (GitHub username/repo rules)
    if (!/^[a-zA-Z0-9_-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      throw new Error('Invalid repository owner or name format');
    }

    if (owner.length > 39 || repo.length > 100) {
      throw new Error('Repository owner or name is too long');
    }

    return { owner, repo };
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid GitHub repository URL format') {
      throw error;
    }
    throw new Error('Invalid URL format. Please provide a valid GitHub repository URL.');
  }
}

/**
 * Validates a SQL query for Coral
 */
export function validateCoralQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    throw new Error('Query is required and must be a string.');
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    throw new Error('Query cannot be empty.');
  }

  if (trimmedQuery.length > 10000) {
    throw new Error('Query is too long. Maximum 10,000 characters.');
  }

  // Basic SQL injection prevention - only allow SELECT statements
  const normalizedQuery = trimmedQuery.toUpperCase();
  
  // Allow only SELECT statements for safety
  if (!normalizedQuery.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed for security reasons.');
  }

  // Block dangerous SQL keywords
  const dangerousKeywords = [
    'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 
    'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC',
    'EXECUTE', 'SCRIPT', 'JAVASCRIPT', 'EVAL'
  ];

  for (const keyword of dangerousKeywords) {
    if (normalizedQuery.includes(keyword)) {
      throw new Error(`Dangerous SQL keyword '${keyword}' is not allowed.`);
    }
  }

  return trimmedQuery;
}

/**
 * Validates a question for the AI
 */
export function validateQuestion(question: string): string {
  if (!question || typeof question !== 'string') {
    throw new Error('Question is required and must be a string.');
  }

  const trimmedQuestion = question.trim();

  if (trimmedQuestion.length === 0) {
    throw new Error('Question cannot be empty.');
  }

  if (trimmedQuestion.length > 2000) {
    throw new Error('Question is too long. Maximum 2,000 characters.');
  }

  return trimmedQuestion;
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

/**
 * Validates and sanitizes AI action type
 */
export function validateAiAction(action: string): string {
  const validActions = ['summary', 'weekly-report', 'priorities', 'duplicates', 'release-notes', 'ask'];
  
  if (!validActions.includes(action)) {
    throw new Error('Invalid AI action.');
  }

  return action;
}
