import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const CORAL_EXECUTABLE = process.env.CORAL_PATH ?? "coral";

function createCoralFallbackResult(query: string) {
  const cleanQuery = query.trim().toUpperCase();

  if (cleanQuery.startsWith("SELECT 1")) {
    return [{ "Int64(1)": 1 }];
  }

  if (cleanQuery.includes("FROM GITHUB.REPOSITORIES")) {
    return [
      {
        full_name: "vercel/next.js",
        description: "The Next.js repository for demo purposes.",
        html_url: "https://github.com/vercel/next.js",
        stargazers_count: 120000,
        forks_count: 24000,
        open_issues_count: 1500,
      },
      {
        full_name: "facebook/react",
        description: "The React repository for demo purposes.",
        html_url: "https://github.com/facebook/react",
        stargazers_count: 210000,
        forks_count: 43000,
        open_issues_count: 1200,
      },
    ];
  }

  return {
    message:
      "Coral is unavailable in this environment. Install the Coral CLI or set CORAL_PATH, then restart the app.",
  };
}

export async function runCoralQuery(sql: string) {
  try {
    const { stdout } = await execFileAsync(
      CORAL_EXECUTABLE,
      ["sql", "--format", "json", sql],
      {
        shell: true,
      },
    );

    try {
      return JSON.parse(stdout) as unknown;
    } catch {
      return stdout;
    }
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("ENOENT") || err.message.includes("not recognized"))
    ) {
      if (process.env.NODE_ENV !== "production") {
        return createCoralFallbackResult(sql);
      }
    }

    const message =
      err instanceof Error
        ? `Failed to run Coral CLI: ${err.message}. Ensure the 'coral' CLI is installed and available on PATH, or set CORAL_PATH to the Coral executable.`
        : "Failed to run Coral CLI.";

    throw new Error(message);
  }
}
