import {
  validateAndParseRepoUrl,
  validateCoralQuery,
  validateQuestion,
} from '@/lib/validation'

describe('Validation Utilities', () => {
  describe('validateAndParseRepoUrl', () => {
    it('should parse a valid GitHub repository URL', () => {
      const result = validateAndParseRepoUrl('https://github.com/vercel/next.js')
      expect(result).toEqual({ owner: 'vercel', repo: 'next.js' })
    })

    it('should throw error for invalid URL format', () => {
      expect(() => validateAndParseRepoUrl('not-a-url')).toThrow()
    })

    it('should throw error for non-GitHub URL', () => {
      expect(() => validateAndParseRepoUrl('https://gitlab.com/user/repo')).toThrow(
        'URL must be from github.com'
      )
    })

    it('should throw error for incomplete GitHub URL', () => {
      expect(() => validateAndParseRepoUrl('https://github.com/user')).toThrow()
    })
  })

  describe('validateCoralQuery', () => {
    it('should accept valid SELECT query', () => {
      const query = 'SELECT * FROM github.repositories LIMIT 5'
      expect(validateCoralQuery(query)).toBe(query)
    })

    it('should throw error for empty query', () => {
      expect(() => validateCoralQuery('')).toThrow('Query cannot be empty')
    })

    it('should throw error for non-SELECT query', () => {
      expect(() => validateCoralQuery('DROP TABLE users')).toThrow(
        'Only SELECT queries are allowed'
      )
    })

    it('should throw error for dangerous SQL keywords', () => {
      expect(() => validateCoralQuery('SELECT * FROM users; DELETE FROM users')).toThrow(
        'Dangerous SQL keyword'
      )
    })
  })

  describe('validateQuestion', () => {
    it('should accept valid question', () => {
      const question = 'What are the main issues in this repository?'
      expect(validateQuestion(question)).toBe(question)
    })

    it('should throw error for empty question', () => {
      expect(() => validateQuestion('')).toThrow('Question cannot be empty')
    })

    it('should throw error for too long question', () => {
      const longQuestion = 'a'.repeat(2001)
      expect(() => validateQuestion(longQuestion)).toThrow('Question is too long')
    })
  })
})
