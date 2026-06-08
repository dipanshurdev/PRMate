import {
  validateGitHubRepoData,
  validatePriorityIssues,
  validateDuplicateIssues,
  validateAIResponse,
} from '@/lib/responseValidation'

describe('Response Validation', () => {
  describe('validateGitHubRepoData', () => {
    it('should validate valid repository data', () => {
      const validData = {
        issues: [
          { number: 1, title: 'Test issue', html_url: 'https://github.com/test/repo/issues/1' },
        ],
        pulls: [
          {
            number: 1,
            title: 'Test PR',
            html_url: 'https://github.com/test/repo/pull/1',
            merged_at: '2024-01-01',
            state: 'closed',
          },
        ],
        commits: [
          {
            sha: 'abc123',
            html_url: 'https://github.com/test/repo/commit/abc123',
            author: { login: 'testuser' },
            commit: {
              message: 'Test commit',
              author: { date: '2024-01-01' },
            },
          },
        ],
      }

      expect(() => validateGitHubRepoData(validData)).not.toThrow()
    })

    it('should throw error for invalid data type', () => {
      expect(() => validateGitHubRepoData(null)).toThrow()
      expect(() => validateGitHubRepoData('string')).toThrow()
      expect(() => validateGitHubRepoData(123)).toThrow()
    })

    it('should throw error for invalid issues array', () => {
      const invalidData = {
        issues: 'not an array',
      }
      expect(() => validateGitHubRepoData(invalidData)).toThrow()
    })
  })

  describe('validatePriorityIssues', () => {
    it('should validate valid priority issues', () => {
      const validIssues = [
        {
          number: 1,
          title: 'High priority issue',
          reason: 'Affects many users',
          urgency: 'high',
          impact: 'high',
          severity: 'high',
        },
      ]

      expect(() => validatePriorityIssues(validIssues)).not.toThrow()
    })

    it('should throw error for non-array input', () => {
      expect(() => validatePriorityIssues('not an array')).toThrow()
    })

    it('should throw error for invalid issue structure', () => {
      const invalidIssues = [{ number: 'not a number', title: 'Test' }]
      expect(() => validatePriorityIssues(invalidIssues)).toThrow()
    })
  })

  describe('validateDuplicateIssues', () => {
    it('should validate valid duplicate issues', () => {
      const validDuplicates = [
        {
          issue1: 'First issue',
          issue2: 'Second issue',
          reason: 'Very similar',
          issue1Number: 1,
          issue2Number: 2,
          similarity: 95,
        },
      ]

      expect(() => validateDuplicateIssues(validDuplicates)).not.toThrow()
    })

    it('should throw error for non-array input', () => {
      expect(() => validateDuplicateIssues('not an array')).toThrow()
    })
  })

  describe('validateAIResponse', () => {
    it('should validate valid AI response', () => {
      const validResponse = 'This is a valid AI response'
      expect(validateAIResponse(validResponse)).toBe(validResponse)
    })

    it('should throw error for non-string input', () => {
      expect(() => validateAIResponse(123)).toThrow()
      expect(() => validateAIResponse(null)).toThrow()
    })

    it('should throw error for empty string', () => {
      expect(() => validateAIResponse('')).toThrow()
    })

    it('should throw error for too long response', () => {
      const longResponse = 'a'.repeat(100001)
      expect(() => validateAIResponse(longResponse)).toThrow()
    })
  })
})
