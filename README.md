# PRMate

Coral-powered repository intelligence for open-source maintainers.

PRMate turns GitHub repository activity into actionable maintainer insights using Gemini, Coral SQL, and the GitHub API.

## 🚀 Features

- **Repository Health Score** — combines open issues and merged PRs into a fast 0–100 signal
- **AI Weekly Summary** — summarizes themes, risks, priorities, and suggested actions
- **Weekly Maintainer Report** — generates a markdown report with health, wins, risks, contributors to watch, and recommended actions
- **AI Issue Prioritization** — ranks top issues by impact, severity, and urgency
- **Duplicate Issue Detection** — finds duplicate or near-duplicate issue reports
- **AI Release Notes** — generates grouped release notes from merged PRs
- **Ask Repository** — asks questions against the fetched GitHub activity snapshot
- **Coral Repository Explorer** — runs SQL through Coral against GitHub-backed data
- **Demo Repository Presets** — one-click analysis for Next.js, React, Vite, and TypeScript

## 🔒 Security Features

PRMate implements several security best practices to ensure safe production use:

- **Environment Variable Validation** — All required API keys are validated at startup
- **Rate Limiting** — API endpoints are rate-limited to prevent abuse
- **Input Validation & Sanitization** — All user inputs are validated and sanitized
- **CORS Configuration** — Proper CORS headers for secure cross-origin requests
- **Security Headers** — Implements X-Frame-Options, X-Content-Type-Options, and other security headers
- **Request Timeouts** — All external API calls have appropriate timeout handling
- **SQL Injection Prevention** — Coral queries are validated to only allow SELECT statements
- **Error Logging** — Comprehensive error logging for debugging and monitoring
- **Health Check Endpoint** — Monitor service status and dependencies

## 🛠 Tech Stack

- **Next.js 16** — React framework with app router
- **React 19** — UI library
- **TypeScript** — Type-safe development
- **Gemini AI** — AI-powered insights
- **Coral SQL** — SQL interface over GitHub data
- **GitHub API** — Repository data source
- **Tailwind CSS** — Styling
- **Octokit** — GitHub API client

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
- Health check: `http://localhost:3000/api/health`

## 🔐 Security Best Practices

### API Keys Management

- Never commit `.env.local` or any files containing real API keys
- Use different API keys for development and production
- Rotate API keys regularly
- Use environment-specific API keys with minimal required permissions

### GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `public_repo` scope (for public repositories)
3. Store the token securely in your environment variables

### Gemini API Key Setup

1. Go to Google AI Studio → API Keys
2. Create a new API key
3. Store the key securely in your environment variables

### Production Deployment

For production deployment, configure environment variables in your deployment platform:

#### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

**Required:**
- `GITHUB_TOKEN`: Your GitHub personal access token
  - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate a new token with `public_repo` scope
  - Copy and paste the token

- `GEMINI_API_KEY`: Your Gemini API key
  - Go to Google AI Studio → API Keys
  - Create a new API key
  - Copy and paste the key

**Optional:**
- `CORAL_PATH`: Full path to Coral executable (if using Coral)
- `NODE_ENV`: Set to `production`

4. Select the environments (Production, Preview, Development) where each variable should be available
5. Redeploy your project to apply the changes

#### General Production Best Practices

1. Use environment-specific configuration
2. Enable additional security headers
3. Set up monitoring and alerting
4. Use HTTPS only
5. Implement proper authentication if needed
6. Regular security audits
7. Keep dependencies updated

### Rate Limits

The application implements the following rate limits:
- `/api/analyze`: 30 requests per minute per IP
- `/api/ai`: 50 requests per minute per IP
- `/api/coral`: 20 requests per minute per IP

## 📊 Monitoring

### Health Check

Monitor the application health using the `/api/health` endpoint:

```bash
curl http://localhost:3000/api/health
```

Response includes:
- Service status
- Configuration status
- Environment information

### Logging

The application uses structured logging for:
- API requests
- Errors
- Rate limit violations
- Performance metrics

## 🧪 Validation

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check code formatting
npm run format:check

# Build for production
npm run build
```

**Note:** Test infrastructure is available but not included in dependencies due to React 19 compatibility. To enable testing, install compatible testing libraries manually or use React 18 compatible versions.

## 🚢 Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard (Settings → Environment Variables):
   - `GITHUB_TOKEN` - Your GitHub API token
   - `GEMINI_API_KEY` - Your Gemini API key
   - `CORAL_PATH` - (optional) Path to Coral executable
   - `NODE_ENV` - Set to `production`
4. Deploy

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t prmate .
docker run -p 3000:3000 --env-file .env.local prmate
```

### Environment Variables for Production

```env
GITHUB_TOKEN=your_production_github_token
GEMINI_API_KEY=your_production_gemini_key
NODE_ENV=production
CORAL_PATH=/usr/local/bin/coral  # if using Coral
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Gemini AI](https://ai.google.dev/)
- SQL interface by [Coral](https://coral.sh/)
- Repository data from [GitHub API](https://docs.github.com/en/rest)
