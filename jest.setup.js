import '@testing-library/jest-dom'

// Mock environment variables
process.env.GITHUB_TOKEN = 'test-token'
process.env.GEMINI_API_KEY = 'test-api-key'
process.env.NODE_ENV = 'test'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))
