"use client";

import { useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

const DEFAULT_QUERY = "SELECT * FROM github.repositories LIMIT 5";

export default function CoralRepositoryExplorerPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runQuery() {
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/coral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const payload = (await res.json()) as {
        result?: unknown;
        error?: string;
      };

      if (!res.ok || payload.error) {
        throw new Error(payload.error ?? "Unable to run Coral query.");
      }

      setResult(payload.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-950 sm:px-8">
      <section className="mx-auto max-w-5xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">
          Powered by Coral SQL
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Coral Repository Explorer
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Run a tiny SQL proof against repository data through Coral. This page
          is intentionally small for a clean hackathon demo — now renamed for
          demo polish.
        </p>

        <label
          className="mt-8 block text-sm font-black uppercase tracking-[0.18em] text-slate-500"
          htmlFor="coral-query"
        >
          Query
        </label>
        <textarea
          id="coral-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-3 min-h-36 w-full border border-slate-300 bg-slate-50 p-4 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={runQuery}
          disabled={isLoading}
          className="mt-4 bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-3 text-sm font-bold text-white rounded-md shadow hover:from-blue-600 hover:to-indigo-500 transition transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Running..." : "Run with Coral"}
        </button>

        {error && (
          <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 border border-slate-300 bg-slate-950 p-4">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Output
          </p>
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-100">
            {result ? JSON.stringify(result, null, 2) : "..."}
          </pre>
        </div>

        <footer className="mt-8  w-fullflex items-center justify-evenly border px-6 py-5 text-sm text-slate-200 shadow-sm sm:px-8">
          <p className="text-base font-semibold text-white">Built by Dipanshu Rawat</p>
          <p className="mt-1 text-slate-300 ">
            GitHub: <a href="https://github.com/dipanshurdev" target="_blank" rel="noreferrer" className="font-semibold text-blue-300 hover:text-blue-200">github.com/dipanshurdev</a>
          </p>
        </footer>
      </section>
    </main>
    </ErrorBoundary>
  );
}
