import { describe, it, expect } from 'vitest'
import { parseUrl, normalizeUrl, normalizePath, isSameDomain, isSubdomain, matchesPattern } from '../jobs/builtins/domain-crawl.js'

describe('parseUrl', () => {
  it('parses a full URL', () => {
    const result = parseUrl('https://example.com/path')
    expect(result).toEqual({
      hostname: 'example.com',
      path: '/path',
      origin: 'https://example.com',
    })
  })

  it('strips www.', () => {
    const result = parseUrl('https://www.example.com/path')
    expect(result!.hostname).toBe('example.com')
  })

  it('adds https:// if missing', () => {
    const result = parseUrl('example.com/path')
    expect(result!.origin).toBe('https://example.com')
    expect(result!.hostname).toBe('example.com')
  })

  it('returns null for invalid URLs', () => {
    expect(parseUrl('')).toBeNull()
  })
})

describe('normalizeUrl', () => {
  it('returns hostname+path', () => {
    expect(normalizeUrl('https://example.com/docs')).toBe('example.com/docs')
  })

  it('strips trailing slash, query, and hash', () => {
    expect(normalizeUrl('https://example.com/docs/?q=1#section')).toBe('example.com/docs')
  })

  it('returns original for invalid URL', () => {
    expect(normalizeUrl('')).toBe('')
  })
})

describe('normalizePath', () => {
  it('returns / for empty path', () => {
    expect(normalizePath('')).toBe('/')
  })

  it('strips query and hash', () => {
    expect(normalizePath('/path?q=1#section')).toBe('/path')
  })

  it('strips trailing slash', () => {
    expect(normalizePath('/path/')).toBe('/path')
  })

  it('preserves root path', () => {
    expect(normalizePath('/')).toBe('/')
  })

  it('adds leading slash', () => {
    expect(normalizePath('path')).toBe('/path')
  })
})

describe('isSameDomain', () => {
  it('returns true for same domain', () => {
    expect(isSameDomain('https://example.com/a', 'https://example.com/b')).toBe(true)
  })

  it('returns false for different domains', () => {
    expect(isSameDomain('https://example.com', 'https://other.com')).toBe(false)
  })

  it('treats www and non-www as same', () => {
    expect(isSameDomain('https://www.example.com', 'https://example.com')).toBe(true)
  })
})

describe('isSubdomain', () => {
  it('returns true for actual subdomain', () => {
    expect(isSubdomain('https://blog.example.com', 'https://example.com')).toBe(true)
  })

  it('returns false for same domain', () => {
    expect(isSubdomain('https://example.com', 'https://example.com')).toBe(false)
  })

  it('returns false for unrelated domains', () => {
    expect(isSubdomain('https://other.com', 'https://example.com')).toBe(false)
  })
})

describe('matchesPattern', () => {
  it('matches exact path', () => {
    expect(matchesPattern('/docs', ['/docs'])).toBe(true)
  })

  it('returns false for different path', () => {
    expect(matchesPattern('/docs', ['/about'])).toBe(false)
  })

  it('matches wildcard prefix', () => {
    expect(matchesPattern('/docs/guide', ['/docs/*'])).toBe(true)
    expect(matchesPattern('/docs', ['/docs/*'])).toBe(true)
  })

  it('matches multiple patterns', () => {
    expect(matchesPattern('/about', ['/docs', '/about'])).toBe(true)
  })

  it('matches glob with * in middle', () => {
    expect(matchesPattern('/api/v2/users', ['/api/*/users'])).toBe(true)
  })
})
