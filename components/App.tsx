"use client";

import type {
  DuplicateIssue,
  GitHubPull,
  PriorityIssue,
  RepoData,
} from "@/types/types";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { SiNextdotjs, SiReact, SiVite, SiTypescript } from "react-icons/si";
import { ClipLoader } from "react-spinners";

type AiAction =
  | "summary"
  | "weekly-report"
  | "priorities"
  | "duplicates"
  | "release-notes"
  | "ask";

const DEFAULT_CORAL_QUERY = "SELECT *\nFROM github.repositories\nLIMIT 5";

const DEMO_REPOSITORIES = [
  { label: "Next.js", url: "https://github.com/vercel/next.js", icon: SiNextdotjs, color: "#000000" },
  { label: "React", url: "https://github.com/facebook/react", icon: SiReact, color: "#61DAFB" },
  { label: "Vite", url: "https://github.com/vitejs/vite", icon: SiVite, color: "#646CFF" },
  { label: "TypeScript", url: "https://github.com/microsoft/TypeScript", icon: SiTypescript, color: "#3178C6" },
];

type StatCard = {
  label: string;
  value: number;
  helper: string;
};

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [data, setData] = useState<RepoData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<AiAction | null>(null);
  const [summary, setSummary] = useState("");
  const [weeklyReport, setWeeklyReport] = useState("");
  const [priorities, setPriorities] = useState<PriorityIssue[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateIssue[]>([]);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [askQuestion, setAskQuestion] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [copied, setCopied] = useState(false);
  const [coralQuery, setCoralQuery] = useState(DEFAULT_CORAL_QUERY);
  const [coralResult, setCoralResult] = useState<unknown>(null);
  const [isCoralLoading, setIsCoralLoading] = useState(false);

  const stats = useMemo<StatCard[]>(() => {
    const issues = data?.issues ?? [];
    const pulls = data?.pulls ?? [];
    const commits = data?.commits ?? [];
    const contributors = new Set(
      commits.map((commit) => commit.author?.login).filter(Boolean),
    ).size;

    return [
      {
        label: "Open Issues",
        value: issues.length,
        helper: "Open maintainer workload",
      },
      {
        label: "Merged PRs",
        value: pulls.filter((pr) => pr.merged_at).length,
        helper: "Completed changes",
      },
      {
        label: "Contributors",
        value: contributors,
        helper: "Recent commit authors",
      },
      {
        label: "Commits",
        value: commits.length,
        helper: "Recent activity",
      },
    ];
  }, [data]);

  const healthScore = useMemo(() => {
    const openIssues = data?.issues?.length ?? 0;
    const mergedPRs = data?.pulls?.filter((pr) => pr.merged_at).length ?? 0;

    return Math.min(
      100,
      Math.max(0, Math.round(100 - openIssues * 0.5 + mergedPRs * 0.8)),
    );
  }, [data]);

  async function analyzeRepositoryUrl(url: string) {
    setError("");
    setData(null);
    resetAiResults();

    if (!url.trim()) {
      setError("Paste a GitHub repository URL to begin.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: url.trim() }),
      });

      const result = (await res.json()) as RepoData;

      if (!res.ok || result.error) {
        throw new Error(result.error ?? "Unable to analyze this repository.");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function analyzeRepo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await analyzeRepositoryUrl(repoUrl);
  }

  async function runDemoPreset(url: string) {
    setRepoUrl(url);
    await analyzeRepositoryUrl(url);
  }

  function resetAiResults() {
    setSummary("");
    setWeeklyReport("");
    setPriorities([]);
    setDuplicates([]);
    setReleaseNotes("");
    setAskAnswer("");
    setCopied(false);
    setCoralResult(null);
    setAiLoading(null);
  }

  function getRepoName() {
    try {
      const url = new URL(repoUrl);
      return url.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
    } catch {
      return "Repository";
    }
  }

  async function runAiAction(action: Exclude<AiAction, "ask">) {
    if (!data) {
      return;
    }

    setError("");
    setAiLoading(action);

    const issues = data.issues ?? [];
    const mergedPulls =
      data.pulls?.filter((pull): pull is GitHubPull =>
        Boolean(pull.merged_at),
      ) ?? [];

    const payload =
      action === "summary"
        ? { action, repoData: data }
        : action === "weekly-report"
          ? {
              action,
              repo: getRepoName(),
              repoData: data,
              healthScore,
            }
          : action === "priorities"
            ? { action, issues }
            : action === "duplicates"
              ? { action, issues }
              : { action, pulls: mergedPulls };

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as {
        summary?: string;
        weeklyReport?: string;
        priorities?: PriorityIssue[];
        duplicates?: DuplicateIssue[];
        releaseNotes?: string;
        error?: string;
      };

      if (!res.ok || result.error) {
        throw new Error(result.error ?? "Unable to complete AI request.");
      }

      if (action === "summary") {
        setSummary(result.summary ?? "");
      }

      if (action === "weekly-report") {
        setWeeklyReport(result.weeklyReport ?? "");
      }

      if (action === "priorities") {
        setPriorities(result.priorities ?? []);
      }

      if (action === "duplicates") {
        setDuplicates(result.duplicates ?? []);
      }

      if (action === "release-notes") {
        setReleaseNotes(result.releaseNotes ?? "");
        setCopied(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAiLoading(null);
    }
  }

  async function askRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!data || !askQuestion.trim()) {
      return;
    }

    setError("");
    setAskAnswer("");
    setAiLoading("ask");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "ask",
          repoData: data,
          question: askQuestion.trim(),
        }),
      });

      const result = (await res.json()) as {
        answer?: string;
        error?: string;
      };

      if (!res.ok || result.error) {
        throw new Error(result.error ?? "Unable to answer this question.");
      }

      setAskAnswer(result.answer ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAiLoading(null);
    }
  }

  async function copyReleaseNotes() {
    if (!releaseNotes) {
      return;
    }

    await navigator.clipboard.writeText(releaseNotes);
    setCopied(true);
  }

  async function runCoralQuery() {
    setError("");
    setCoralResult(null);
    setIsCoralLoading(true);

    try {
      const res = await fetch("/api/coral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: coralQuery }),
      });

      const payload = (await res.json()) as {
        result?: unknown;
        error?: string;
      };

      if (!res.ok || payload.error) {
        throw new Error(payload.error ?? "Unable to run Coral query.");
      }

      setCoralResult(payload.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsCoralLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-950 sm:px-8">
      {(isLoading || aiLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
            <ClipLoader color="#3b82f6" size={50} />
            <p className="text-lg font-bold text-slate-900">
              {isLoading ? "Analyzing repository..." : "Processing insights..."}
            </p>
            <p className="text-sm text-slate-500">
              {isLoading ? "Fetching GitHub data" : `${aiLoading === "summary" ? "Generating summary" : aiLoading === "weekly-report" ? "Creating weekly report" : aiLoading === "priorities" ? "Prioritizing issues" : aiLoading === "duplicates" ? "Finding duplicates" : aiLoading === "release-notes" ? "Generating release notes" : "Processing"}`}
            </p>
          </div>
        </div>
      )}
      <section className="mx-auto max-w-7xl">
        <header className="border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">
            Repository Health Dashboard
          </p>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                OSS First Mate
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                <span className="bg-gradient-to-r from-neutral-700 to-neutral-900 bg-clip-text text-transparent font-bold">
                    PRMate 
                    </span> {" "}
                    Analyze GitHub activity, summarize maintainer workload, rank
                priority issues, detect duplicates, generate release notes, and
                create weekly maintainer reports.
              </p>
            </div>
            {data && (
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                Viewing {getRepoName()}
              </div>
            )}
          </div>

          <form
            onSubmit={analyzeRepo}
            className="mt-8 grid gap-3 border border-slate-300 bg-slate-50 p-3 md:grid-cols-[1fr_auto]"
          >
            <label className="sr-only" htmlFor="repo-url">
              Repository URL
            </label>
            <input
              id="repo-url"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/vercel/next.js"
              className="min-h-14 border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-14 font-bold text-white rounded-none shadow bg-blue-950 transition transform hover:-translate-y-0.5 px-2.5 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? "Analyzing..." : "Analyze Repository"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Demo presets
            </span>
            {DEMO_REPOSITORIES.map((repo) => {
              const IconComponent = repo.icon;
              return (
                <button
                  key={repo.url}
                  type="button"
                  onClick={() => runDemoPreset(repo.url)}
                  disabled={isLoading}
                  className="flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 rounded-none transition hover:border-blue-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IconComponent size={18} color={repo.color} />
                  {repo.label}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </header>

        <DashboardSection
          eyebrow="Stats Cards"
          title="Repository Health"
          description="The core signals maintainers scan first."
        >
          <div className="mb-4 border border-slate-300 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
                  Health Score
                </p>
                <p className="mt-4 text-6xl font-black">
                  {data ? healthScore : 0}
                  <span className="text-2xl text-slate-400">/100</span>
                </p>
              </div>
              <p className="max-w-lg text-sm leading-7 text-slate-300">
                Calculated from open issues and merged pull requests. It gives
                judges an instant "is this repo healthy?" moment.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="border border-slate-300 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-4 text-5xl font-black">
                      {stat.value.toLocaleString()}
                      {stat.value ? "+" : ""}
                    </p>
                  </div>
                  <span className="bg-slate-950 px-3 py-1 text-xs font-black text-white">
                    LIVE
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">
                  {data ? stat.helper : "Analyze a repo to populate this card."}
                </p>
              </article>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="AI Weekly Summary"
          title="Maintainer Brief"
          description="Gemini turns issues, PRs, and commits into a readable weekly report."
          action={
            <ActionButton
              disabled={!data || aiLoading !== null}
              loading={aiLoading === "summary"}
              onClick={() => runAiAction("summary")}
            >
              Generate Weekly Summary
            </ActionButton>
          }
        >
          {summary ? (
            <SummaryContent content={summary} />
          ) : (
            <EmptyState text="Generate a weekly summary after analyzing a repository." />
          )}
        </DashboardSection>

        <DashboardSection
          eyebrow="Weekly Maintainer Report"
          title="Senior Maintainer Report"
          description="Generates a polished markdown report with health, wins, risks, contributors to watch, and recommended actions."
          action={
            <ActionButton
              disabled={!data || aiLoading !== null}
              loading={aiLoading === "weekly-report"}
              onClick={() => runAiAction("weekly-report")}
            >
              Generate Weekly Report
            </ActionButton>
          }
        >
          {weeklyReport ? (
            <div className="border border-slate-200 bg-slate-50 p-5">
              <MarkdownContent content={weeklyReport} />
            </div>
          ) : (
            <EmptyState text="Generate a weekly maintainer report for a demo-ready executive summary." />
          )}
        </DashboardSection>

        <DashboardSection
          eyebrow="Top Priority Issues"
          title="Highest Priority"
          description="Ranks open issues by impact, severity, and urgency."
          action={
            <ActionButton
              disabled={!data || aiLoading !== null}
              loading={aiLoading === "priorities"}
              onClick={() => runAiAction("priorities")}
            >
              Prioritize Issues
            </ActionButton>
          }
        >
          {priorities.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {priorities.map((issue) => (
                <article
                  key={`${issue.number}-${issue.title}`}
                  className="border border-slate-300 bg-white p-5"
                >
                  <p className="text-sm font-black text-red-600">
                    #{issue.number}
                  </p>
                  <h3 className="mt-2 text-xl font-black">{issue.title}</h3>
                  <p className="mt-4 text-sm font-bold text-slate-500">
                    Reason:
                  </p>
                  <p className="mt-1 leading-7 text-slate-700">
                    {issue.reason}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {issue.urgency && <span>Urgency: {issue.urgency}</span>}
                    {issue.impact && <span>Impact: {issue.impact}</span>}
                    {issue.severity && <span>Severity: {issue.severity}</span>}
                    {issue.maintainability && (
                      <span>Maintainability: {issue.maintainability}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="Run the prioritizer to surface the top 5 maintainer issues." />
          )}
        </DashboardSection>

        <DashboardSection
          eyebrow="Duplicate Issues"
          title="Near-Duplicate Detector"
          description="Finds duplicate-looking issue reports so maintainers can merge triage paths."
          action={
            <ActionButton
              disabled={!data || aiLoading !== null}
              loading={aiLoading === "duplicates"}
              onClick={() => runAiAction("duplicates")}
            >
              Find Duplicates
            </ActionButton>
          }
        >
          {duplicates.length > 0 ? (
            <div className="grid gap-4">
              {duplicates.map((duplicate, index) => (
                <article
                  key={`${duplicate.issue1}-${duplicate.issue2}-${index}`}
                  className="grid gap-4 border border-slate-300 bg-white p-5 lg:grid-cols-[1fr_auto_1fr]"
                >
                  <IssueMiniCard
                    number={duplicate.issue1Number}
                    title={duplicate.issue1}
                  />
                  <div className="flex items-center justify-center">
                    <span className="bg-blue-600 px-4 py-2 text-sm font-black text-white">
                      {duplicate.similarity ?? 90}% Similar
                    </span>
                  </div>
                  <IssueMiniCard
                    number={duplicate.issue2Number}
                    title={duplicate.issue2}
                  />
                  <p className="border-t border-slate-200 pt-4 text-sm leading-7 text-slate-600 lg:col-span-3">
                    {duplicate.reason}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="Run duplicate detection to compare issue titles semantically." />
          )}
        </DashboardSection>

        <DashboardSection
          eyebrow="Generated Release Notes"
          title="Markdown Changelog"
          description="Uses merged PRs only and groups changes for release communication."
          action={
            <div className="flex flex-wrap gap-2">
              <ActionButton
                disabled={!data || aiLoading !== null}
                loading={aiLoading === "release-notes"}
                onClick={() => runAiAction("release-notes")}
              >
                Generate Release Notes
              </ActionButton>
              <button
                type="button"
                disabled={!releaseNotes}
                onClick={copyReleaseNotes}
                className="border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          }
        >
          {releaseNotes ? (
            <div className="border border-slate-200 bg-slate-50 p-5">
              <MarkdownContent content={releaseNotes} />
            </div>
          ) : (
            <EmptyState text="Generate release notes from merged pull requests." />
          )}
        </DashboardSection>

        <DashboardSection
          eyebrow="Repository SQL Explorer"
          title="Coral Query Explorer"
          description="A demo-ready Coral SQL panel that proves AI + GitHub + Coral can live in one maintainer workflow."
          action={
            <ActionButton
              disabled={isCoralLoading}
              loading={isCoralLoading}
              onClick={runCoralQuery}
            >
              Run With Coral
            </ActionButton>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="border border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Generated Coral Query
              </p>
              <textarea
                value={coralQuery}
                onChange={(event) => setCoralQuery(event.target.value)}
                className="mt-4 min-h-44 w-full border border-slate-300 bg-white p-4 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Powered by Coral SQL
              </p>
            </div>

            <div className="border border-slate-300 bg-slate-950 p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Results
              </p>
              <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-100">
                {coralResult ? JSON.stringify(coralResult, null, 2) : "..."}
              </pre>
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="Ask Repository"
          title="Repository Q&A"
          description="Ask anything about the fetched GitHub data. No RAG yet — just the current snapshot."
        >
          <form onSubmit={askRepository} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="ask-repository">
              Ask anything about this repository
            </label>
            <input
              id="ask-repository"
              value={askQuestion}
              onChange={(event) => setAskQuestion(event.target.value)}
              placeholder="What should maintainers focus on?"
              className="min-h-14 border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={!data || !askQuestion.trim() || aiLoading !== null}
              className="min-h-14 bg-slate-950 px-8 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading === "ask" ? "Asking..." : "Ask"}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "What bugs appear most often?",
              "Which area receives the most contributions?",
              "What changed recently?",
              "What should maintainers focus on?",
            ].map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setAskQuestion(question)}
                className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-500 hover:text-blue-700"
              >
                {question}
              </button>
            ))}
          </div>
          {askAnswer && (
            <div className="mt-5 border border-slate-200 bg-white p-5">
              <MarkdownContent content={askAnswer} />
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          eyebrow="Why This Matters"
          title="Built for Maintainer Time"
          description="Hackathon demos land better when judges understand the pain in one screen."
        >
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border border-slate-300 bg-slate-50 p-5">
              <h3 className="text-xl font-black">
                Maintainers spend hours reviewing:
              </h3>
              <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
                <li>• Issues and duplicate reports</li>
                <li>• Pull requests and release planning</li>
                <li>• Repository risks and contributor activity</li>
              </ul>
            </div>
            <div className="border border-blue-200 bg-blue-50 p-5">
              <h3 className="text-xl font-black text-blue-950">
                PRMate automates these workflows.
              </h3>
              <p className="mt-4 leading-7 text-blue-900">
                It combines GitHub activity, Gemini reasoning, and Coral SQL to
                turn noisy repository data into actionable maintainer insights.
              </p>
            </div>
          </div>
        </DashboardSection>

        <footer className="mt-8 flex items-center justify-between  px-6 py-6 text-sm  shadow-sm sm:px-8">
          <p className="text-base font-semibold ">
            Built by Dipanshu Rawat
          </p>
          <p className="  flex items-center gap-1">
            GitHub: <a href="https://github.com/dipanshurdev" target="_blank" rel="noreferrer" className="font-semibold text-blue-300 hover:text-blue-200">github.com/dipanshurdev</a>
          </p>
          <p className="mt-3 text-slate-400">
            PRMate is a hackathon demo for open-source maintainer intelligence.
          </p>
        </footer>
      </section>
    </main>
  );
}

function DashboardSection({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-6 border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">{title}</h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ActionButton({
  children,
  disabled,
  loading,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className=" px-5 py-3 cursor-pointer text-sm font-bold text-white rounded-none shadow bg-blue-950 transition transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Working..." : children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}

function IssueMiniCard({
  number,
  title,
}: {
  number?: number;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-black text-slate-500">
        {number ? `Issue #${number}` : "Issue"}
      </p>
      <h3 className="mt-2 text-lg font-black text-slate-950">{title}</h3>
    </div>
  );
}

function SummaryContent({ content }: { content: string }) {
  const sections = parseSummarySections(content);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map((section, index) => (
        <article key={section.title} className="border border-slate-300 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-slate-950 text-sm font-black text-white">
              {index + 1}
            </div>
            <h3 className="text-xl font-black">{section.title}</h3>
          </div>
          <div className="space-y-3">
            {section.items.map((item, itemIndex) => (
              <div
                key={`${section.title}-${itemIndex}`}
                className="border border-slate-200 bg-slate-50 p-4 leading-7 text-slate-700"
              >
                <div className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  <p>{renderInlineMarkdown(item)}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-7 text-slate-700">
      {content.split("\n").map((line, index) => {
        const key = `${line}-${index}`;
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return <div key={key} className="h-2" />;
        }

        if (trimmedLine.startsWith("### ")) {
          return (
            <h4 key={key} className="pt-3 text-lg font-bold text-slate-950">
              {trimmedLine.replace("### ", "")}
            </h4>
          );
        }

        if (trimmedLine.startsWith("## ")) {
          return (
            <h4 key={key} className="pt-4 text-xl font-black text-slate-950">
              {trimmedLine.replace("## ", "")}
            </h4>
          );
        }

        if (trimmedLine.startsWith("# ")) {
          return (
            <h4 key={key} className="pt-4 text-2xl font-black text-slate-950">
              {trimmedLine.replace("# ", "")}
            </h4>
          );
        }

        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          return (
            <p key={key} className="pl-4 text-slate-700">
              • {renderInlineMarkdown(trimmedLine.replace(/^[-*]\s*/, ""))}
            </p>
          );
        }

        return <p key={key}>{renderInlineMarkdown(trimmedLine)}</p>;
      })}
    </div>
  );
}

function parseSummarySections(content: string) {
  const sectionTitles = new Set([
    "Main Themes",
    "Priorities",
    "Risks",
    "Suggestions",
    "Suggested Next Actions",
  ]);

  const sections: { title: string; items: string[] }[] = [];
  let currentSection: { title: string; items: string[] } | null = null;

  for (const line of content.split("\n")) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      continue;
    }

    const heading = trimmedLine.replace(/^#+\s*/, "").replace(/:$/, "");

    if (sectionTitles.has(heading)) {
      currentSection = { title: heading, items: [] };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      currentSection = { title: "Summary", items: [] };
      sections.push(currentSection);
    }

    currentSection.items.push(trimmedLine.replace(/^[-*]\s*/, ""));
  }

  return sections.filter((section) => section.items.length > 0);
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-black text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
