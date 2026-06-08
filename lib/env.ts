/**
 * Environment variable validation and type safety
 * This file ensures all required environment variables are present and valid at runtime
 */

interface EnvConfig {
  GITHUB_TOKEN: string;
  GEMINI_API_KEY: string;
  CORAL_PATH?: string;
  NODE_ENV: string;
}

function validateEnv(): EnvConfig {
  const githubToken = process.env.GITHUB_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const coralPath = process.env.CORAL_PATH;
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is required. Please set it in your environment variables.');
  }

  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required. Please set it in your environment variables.');
  }

  // Validate token format (basic check for GitHub token)
  if (githubToken.length < 20) {
    throw new Error('GITHUB_TOKEN appears to be invalid. Please check your GitHub token.');
  }

  // Validate API key format (basic check for Gemini API key)
  if (geminiApiKey.length < 20) {
    throw new Error('GEMINI_API_KEY appears to be invalid. Please check your Gemini API key.');
  }

  return {
    GITHUB_TOKEN: githubToken,
    GEMINI_API_KEY: geminiApiKey,
    CORAL_PATH: coralPath,
    NODE_ENV: nodeEnv,
  };
}

// Export validated environment config
export const env = validateEnv();

// Export type for use in other files
export type { EnvConfig };
