# Contributing to PRMate

Thank you for your interest in contributing to PRMate! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/prmate.git
   cd prmate
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env.local` and fill in your API keys
5. Start the development server:
   ```bash
   npm run dev
   ```

## Code Style

We use Prettier and ESLint to maintain code quality:

```bash
# Format code
npm run format

# Check code formatting
npm run format:check

# Lint code
npm run lint
```

**Note:** Test infrastructure files are included but testing dependencies are not installed due to React 19 compatibility requirements. To enable testing, install React 19-compatible testing libraries or downgrade to React 18.

## Project Structure

```
prmate/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── analyze/       # Repository analysis endpoint
│   │   ├── ai/            # AI-powered features endpoint
│   │   ├── coral/         # Coral SQL query endpoint
│   │   └── health/        # Health check endpoint
│   ├── coral/             # Coral explorer page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── App.tsx           # Main application component
├── lib/                   # Utility libraries
│   ├── coral.ts          # Coral integration
│   ├── env.ts            # Environment variable validation
│   ├── gemini.ts         # Gemini AI integration
│   ├── github.ts         # GitHub API integration
│   ├── logger.ts         # Logging utility
│   ├── rate-limit.ts     # Rate limiting
│   ├── timeout.ts        # Timeout utilities
│   └── validation.ts     # Input validation
├── types/                 # TypeScript type definitions
│   └── types.ts
└── public/               # Static assets
```

## Making Changes

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes following the project's coding standards
3. Test your changes thoroughly
4. Commit your changes with clear messages
5. Push to your fork and submit a pull request

## Commit Message Convention

Follow conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example:
```
feat: add duplicate issue detection
fix: improve error handling in GitHub API integration
docs: update README with deployment instructions
```

## Testing

Before submitting a PR, ensure:
- Code follows the project's style guidelines
- All functionality works as expected
- No console errors or warnings
- Changes are well-documented

## Security Considerations

- Never commit API keys or sensitive data
- Validate all user inputs
- Follow security best practices
- Report security vulnerabilities privately

## Questions or Issues?

Feel free to open an issue for questions, bug reports, or feature requests.

## License

By contributing to PRMate, you agree that your contributions will be licensed under the MIT License.
