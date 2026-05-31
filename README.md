# PRMate (OSS First Mate)

Coral-powered repository intelligence for open-source maintainers.

PRMate turns GitHub repository activity into actionable maintainer insights using Gemini, Coral SQL, and the GitHub API.

## Problem

Open-source maintainers spend significant time:

- triaging issues
- reviewing pull requests
- detecting duplicate reports
- generating release notes
- identifying project risks
- understanding recent repository activity

That work is valuable, but it is repetitive and often slows down maintainers who should be focused on decisions.

## Solution

PRMate analyzes repository activity and generates a maintainer-ready dashboard:

- health score
- weekly maintainer report
- AI issue prioritization
- duplicate issue detection
- AI release notes
- repository Q&A
- Coral SQL repository explorer

The goal is simple: turn noisy repository data into clear next actions.

## Features

- **Repository Health Score** — combines open issues and merged PRs into a fast 0–100 signal.
- **AI Weekly Summary** — summarizes themes, risks, priorities, and suggested actions.
- **Weekly Maintainer Report** — generates a markdown report with health, wins, risks, contributors to watch, and recommended actions.
- **AI Issue Prioritization** — ranks top issues by impact, severity, and urgency.
- **Duplicate Issue Detection** — finds duplicate or near-duplicate issue reports.
- **AI Release Notes** — generates grouped release notes from merged PRs.
- **Ask Repository** — asks questions against the fetched GitHub activity snapshot.
- **Coral Repository Explorer** — runs SQL through Coral against GitHub-backed data.
- **Demo Repository Presets** — one-click analysis for Next.js, React, Vite, and TypeScript.

## Tech Stack

- Next.js
- React
- Gemini
- Coral
- GitHub API
- Tailwind CSS

## Architecture

```text
GitHub API
↓
Repository Activity Snapshot
↓
Gemini
↓
Insights Dashboard

Coral SQL
↓
Repository Explorer
↓
Demo Query Results
```

## Demo Flow

1. Open the dashboard.
2. Click the **Next.js** preset.
3. Show the repository health score, issues, PRs, contributors, and commits.
4. Generate the AI weekly summary.
5. Generate top priority issues.
6. Generate release notes.
7. Generate the weekly maintainer report.
8. Open the Coral Repository Explorer.
9. Run:

```sql
SELECT *
FROM github.repositories
LIMIT 5
```

10. Explain: Coral provides a unified SQL interface over repository data.

## 2-Minute Demo Script

### 0–20 seconds

Open-source maintainers spend hours understanding repository activity: issues, pull requests, release planning, and risk.

### 20–60 seconds

Analyze `https://github.com/vercel/next.js` with the preset button.

Show:

- health score
- repository stats
- AI weekly summary
- priority issues

### 60–90 seconds

Generate release notes and the weekly maintainer report.

Show:

- grouped release notes
- report health
- wins
- risks
- recommended actions

### 90–120 seconds

Open the Coral Repository Explorer.

Run:

```sql
SELECT *
FROM github.repositories
LIMIT 5
```

Explain:

Coral provides a unified SQL interface over GitHub data. PRMate combines Coral + Gemini + GitHub to turn repository activity into actionable maintainer insights.

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
```

If Coral is not available from your Node environment, set `CORAL_PATH` to the Coral executable:

```env
CORAL_PATH=C:\path\to\coral.exe
```

Run the development server:

```bash
npm run dev
```

Open:

- dashboard: `http://localhost:3000`
- Coral Repository Explorer: `http://localhost:3000/coral`

## Validation

```bash
npm run lint
npm run build
```
