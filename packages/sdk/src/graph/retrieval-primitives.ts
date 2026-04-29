export interface GraphQueryDecomposition {
  query: string
  terms: string[]
  entityPhrases: string[]
  relationHints: string[]
  subqueries: string[]
}

export interface FactSearchTextInput {
  factText: string
  description?: string | undefined
  evidenceText?: string | undefined
}

const STOP_WORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'from', 'into', 'about', 'what', 'which',
  'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'did', 'does', 'are',
  'was', 'were', 'is', 'in', 'on', 'of', 'to', 'for', 'by', 'as', 'a', 'an',
  'including', 'include', 'relation', 'relationship', 'novel', 'narrative',
  'describe', 'summarize', 'summarise', 'write', 'create', 'generate',
])

const RELATION_HINTS = [
  'born', 'built', 'called', 'contained', 'contains', 'created', 'designed',
  'employed', 'found', 'invented', 'known', 'located', 'married', 'owned',
  'played', 'practiced', 'produced', 'served', 'used', 'wrote',
]

export function normalizeGraphText(value: string): string {
  return value
    .replace(/[Ææ]/g, 'ae')
    .replace(/[Œœ]/g, 'oe')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function graphQueryTokens(query: string): Set<string> {
  const normalized = normalizeGraphText(query)
  return new Set(normalized.split(/\s+/).filter(token => token.length >= 3 && !STOP_WORDS.has(token)))
}

export function tokenOverlapScore(queryTokenSet: Set<string>, text: string): number {
  if (queryTokenSet.size === 0) return 0
  const textTokens = new Set(normalizeGraphText(text).split(/\s+/).filter(Boolean))
  let hits = 0
  for (const token of queryTokenSet) {
    if (textTokens.has(token)) hits++
  }
  return hits / Math.max(1, queryTokenSet.size)
}

export function buildFactSearchText(input: FactSearchTextInput): string {
  return [input.factText, input.description, input.evidenceText]
    .map(part => part?.trim())
    .filter((part): part is string => !!part)
    .join('\n')
}

export function formatFactEvidence(input: FactSearchTextInput): string {
  const description = input.description?.trim()
  const evidenceText = input.evidenceText?.trim()
  if (description && evidenceText) return `${input.factText}: ${description} Evidence: ${evidenceText}`
  if (description) return `${input.factText}: ${description}`
  if (evidenceText) return `${input.factText}: ${evidenceText}`
  return input.factText
}

export function decomposeGraphQuery(query: string): GraphQueryDecomposition {
  const terms = [...graphQueryTokens(query)].slice(0, 16)
  const entityPhrases = extractEntityPhrases(query)
  const relationHints = RELATION_HINTS.filter(hint => normalizeGraphText(query).split(/\s+/).includes(hint))
  const subqueries = unique([
    ...entityPhrases,
    relationHints.length > 0 ? `${entityPhrases.join(' ')} ${relationHints.join(' ')}`.trim() : '',
    terms.slice(0, 8).join(' '),
  ]).filter(value => value && normalizeGraphText(value) !== normalizeGraphText(query))

  return {
    query,
    terms,
    entityPhrases,
    relationHints,
    subqueries: subqueries.slice(0, 4),
  }
}

function extractEntityPhrases(query: string): string[] {
  const phrases: string[] = []
  const seen = new Set<string>()
  const add = (value: string) => {
    const cleaned = value.replace(/\s+/g, ' ').trim()
    if (!cleaned || cleaned.length <= 1 || cleaned.length > 100) return
    const key = normalizeGraphText(cleaned)
    if (!key || seen.has(key)) return
    seen.add(key)
    phrases.push(cleaned)
  }

  for (const match of query.matchAll(/["'“”‘’]([^"'“”‘’]{2,100})["'“”‘’]/g)) {
    add(match[1] ?? '')
  }
  for (const match of query.matchAll(/\b[A-Z][\p{L}\p{N}'’.-]*(?:\s+[A-Z][\p{L}\p{N}'’.-]*){0,5}\b/gu)) {
    add(match[0])
  }

  return phrases.slice(0, 8)
}

function unique(items: string[]): string[] {
  return [...new Set(items)]
}
