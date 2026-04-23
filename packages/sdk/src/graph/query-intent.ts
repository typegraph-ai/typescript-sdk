import { z } from 'zod'
import type { LLMProvider } from '../types/llm-provider.js'
import type { GraphExploreIntent, GraphExploreIntentFamily } from '../types/graph-bridge.js'

export interface RelationFamilyDefinition {
  name: string
  predicates: string[]
  synonyms: string[]
  anchorEntityTypes: string[]
  resultEntityTypes: string[]
  anchorSide: 'source' | 'target' | 'either'
}

export interface ParsedGraphExploreIntent {
  parser: 'llm' | 'fallback'
  intent: GraphExploreIntent
}

export const RELATION_FAMILY_REGISTRY: RelationFamilyDefinition[] = [
  {
    name: 'employment',
    predicates: ['WORKS_FOR', 'WORKED_FOR', 'MEMBER_OF'],
    synonyms: ['employees at', 'employees of', 'employee at', 'employee of', 'employees', 'employee', 'works at', 'works for', 'worked at', 'worked for', 'employed by', 'staff at', 'staff of', 'team at', 'team members'],
    anchorEntityTypes: ['organization'],
    resultEntityTypes: ['person'],
    anchorSide: 'target',
  },
  {
    name: 'leadership',
    predicates: ['LEADS', 'LED', 'FOUNDED', 'CO_FOUNDED'],
    synonyms: ['leaders at', 'leaders of', 'leadership', 'leader', 'leaders', 'founder', 'founders', 'cofounder', 'co-founder', 'runs', 'run by', 'headed by', 'heads'],
    anchorEntityTypes: ['organization'],
    resultEntityTypes: ['person'],
    anchorSide: 'target',
  },
  {
    name: 'advisory',
    predicates: ['ADVISES', 'ADVISED'],
    synonyms: ['advisor', 'advisors', 'advised', 'advises', 'advisory'],
    anchorEntityTypes: ['organization', 'person', 'concept'],
    resultEntityTypes: ['person', 'organization', 'concept'],
    anchorSide: 'either',
  },
  {
    name: 'creation',
    predicates: ['CREATED', 'WROTE', 'AUTHORED', 'DESIGNED', 'INVENTED', 'DEVELOPED'],
    synonyms: ['created', 'creator', 'creators', 'built', 'wrote', 'written by', 'authored', 'author', 'designed', 'invented', 'developed'],
    anchorEntityTypes: ['organization', 'person', 'concept'],
    resultEntityTypes: ['person', 'organization', 'concept', 'document'],
    anchorSide: 'either',
  },
  {
    name: 'ownership',
    predicates: ['OWNS', 'OWNED_BY'],
    synonyms: ['owner', 'owners', 'owned by', 'owns', 'owning'],
    anchorEntityTypes: ['organization', 'person', 'asset'],
    resultEntityTypes: ['person', 'organization', 'asset'],
    anchorSide: 'either',
  },
  {
    name: 'location',
    predicates: ['HEADQUARTERED_IN', 'LOCATED_IN', 'OPERATES_IN', 'BORN_IN', 'LIVES_IN', 'LIVED_IN'],
    synonyms: ['located in', 'based in', 'headquartered in', 'operates in', 'born in', 'lives in', 'lived in', 'where is', 'where are'],
    anchorEntityTypes: ['organization', 'person', 'place'],
    resultEntityTypes: ['location', 'place'],
    anchorSide: 'either',
  },
  {
    name: 'collaboration',
    predicates: ['COLLABORATED_WITH', 'PARTNERED_WITH', 'ALLIED_WITH'],
    synonyms: ['collaborated with', 'collaborators', 'collaboration', 'partnered with', 'partners', 'worked with', 'allied with'],
    anchorEntityTypes: ['organization', 'person'],
    resultEntityTypes: ['organization', 'person'],
    anchorSide: 'either',
  },
  {
    name: 'proposal',
    predicates: ['PROPOSED', 'ADVOCATED_FOR', 'CHAMPIONED'],
    synonyms: ['proposed', 'proposal', 'proposals', 'advocated for', 'championed', 'recommended'],
    anchorEntityTypes: ['person', 'organization', 'concept'],
    resultEntityTypes: ['concept', 'initiative', 'project', 'organization'],
    anchorSide: 'source',
  },
]

const RELATION_FAMILY_BY_NAME = new Map(RELATION_FAMILY_REGISTRY.map(family => [family.name, family]))

const relationFamilyNameSchema = z.enum([
  'employment',
  'leadership',
  'advisory',
  'creation',
  'ownership',
  'location',
  'collaboration',
  'proposal',
])

const intentSchema = z.object({
  anchorText: z.string().default(''),
  relationFamilies: z.array(z.object({
    name: relationFamilyNameSchema,
    confidence: z.number().min(0).max(1).optional(),
  })).default([]),
  targetEntityTypes: z.array(z.string()).max(8).default([]),
})

const FILLER_WORDS = new Set([
  'a', 'an', 'all', 'and', 'are', 'at', 'find', 'for', 'from', 'in', 'list',
  'me', 'of', 'on', 'show', 'the', 'their', 'these', 'those', 'what', 'who',
  'with',
])

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

export function getRelationFamily(name: string): RelationFamilyDefinition | undefined {
  return RELATION_FAMILY_BY_NAME.get(name)
}

export function resolveRelationFamilies(names?: string[] | undefined): RelationFamilyDefinition[] {
  if (!names || names.length === 0) return []
  return unique(names)
    .map(name => RELATION_FAMILY_BY_NAME.get(name))
    .filter((family): family is RelationFamilyDefinition => Boolean(family))
}

function stripFamilyPhrases(query: string, families: RelationFamilyDefinition[]): string {
  let text = query
  const phrases = unique(families.flatMap(family => family.synonyms))
    .sort((a, b) => b.length - a.length)

  for (const phrase of phrases) {
    const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi')
    text = text.replace(pattern, ' ')
  }

  return text
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 0)
    .filter(token => !FILLER_WORDS.has(token.toLowerCase()))
    .join(' ')
    .trim()
}

function buildIntent(
  rawQuery: string,
  families: Array<RelationFamilyDefinition & { confidence: number }>,
  anchorText: string,
): GraphExploreIntent {
  const targetEntityTypes = unique(families.flatMap(family => family.resultEntityTypes))
  const relationFamilies: GraphExploreIntentFamily[] = families.map(family => ({
    name: family.name,
    predicates: family.predicates,
    confidence: family.confidence,
  }))

  return {
    rawQuery,
    anchorText: anchorText.trim(),
    relationFamilies,
    targetEntityTypes,
  }
}

function fallbackFamilies(query: string): Array<RelationFamilyDefinition & { confidence: number }> {
  const lowered = query.toLowerCase()
  const matches: Array<RelationFamilyDefinition & { confidence: number; score: number }> = []

  for (const family of RELATION_FAMILY_REGISTRY) {
    let bestScore = 0
    for (const synonym of family.synonyms) {
      const index = lowered.indexOf(synonym.toLowerCase())
      if (index === -1) continue
      bestScore = Math.max(bestScore, synonym.length)
    }
    if (bestScore > 0) {
      matches.push({
        ...family,
        confidence: Math.min(0.98, 0.65 + (bestScore / Math.max(lowered.length, 1)) * 0.5),
        score: bestScore,
      })
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .map(({ score: _score, ...family }) => family)
}

async function parseWithLlm(query: string, llm: LLMProvider): Promise<GraphExploreIntent | null> {
  const prompt = [
    'Parse this graph exploration query into anchor text and relation families.',
    '',
    `Query: ${query}`,
    '',
    'Allowed relation families:',
    ...RELATION_FAMILY_REGISTRY.map(family =>
      `- ${family.name}: predicates=${family.predicates.join(', ')}; anchorEntityTypes=${family.anchorEntityTypes.join(', ')}; targetEntityTypes=${family.resultEntityTypes.join(', ')}; synonyms=${family.synonyms.join(', ')}`,
    ),
    '',
    'Return JSON only with this shape:',
    '{ "anchorText": string, "relationFamilies": [{ "name": string, "confidence": number }], "targetEntityTypes": string[] }',
    '',
    'Rules:',
    '- Only use the allowed relation family names.',
    '- Do not invent predicates.',
    '- Keep anchorText concise and literal.',
    '- If no relation family clearly applies, return relationFamilies as an empty array.',
  ].join('\n')

  const raw = await llm.generateJSON<z.infer<typeof intentSchema>>(prompt, undefined, {
    schema: intentSchema,
    maxOutputTokens: 512,
  })
  const parsed = intentSchema.parse(raw)
  const families = parsed.relationFamilies
    .map(item => {
      const family = getRelationFamily(item.name)
      return family ? { ...family, confidence: item.confidence ?? 0.8 } : null
    })
    .filter((family): family is RelationFamilyDefinition & { confidence: number } => Boolean(family))

  const anchorText = parsed.anchorText.trim() || stripFamilyPhrases(query, families)
  return {
    rawQuery: query,
    anchorText: anchorText.trim() || query.trim(),
    relationFamilies: families.map(family => ({
      name: family.name,
      predicates: family.predicates,
      confidence: family.confidence,
    })),
    targetEntityTypes: parsed.targetEntityTypes.length > 0
      ? unique(parsed.targetEntityTypes)
      : unique(families.flatMap(family => family.resultEntityTypes)),
  }
}

export async function parseGraphExploreIntent(input: {
  query: string
  llm?: LLMProvider | undefined
  relationFamilies?: string[] | undefined
}): Promise<ParsedGraphExploreIntent> {
  const explicitFamilies = resolveRelationFamilies(input.relationFamilies)
  if (explicitFamilies.length > 0) {
    const families = explicitFamilies.map(family => ({ ...family, confidence: 1 }))
    const anchorText = stripFamilyPhrases(input.query, explicitFamilies)
    return {
      parser: 'fallback',
      intent: buildIntent(input.query, families, anchorText || input.query),
    }
  }

  if (input.llm) {
    try {
      const llmIntent = await parseWithLlm(input.query, input.llm)
      if (llmIntent) {
        return { parser: 'llm', intent: llmIntent }
      }
    } catch {
      // Fall through to deterministic parsing.
    }
  }

  const families = fallbackFamilies(input.query)
  const anchorText = families.length > 0
    ? stripFamilyPhrases(input.query, families)
    : input.query.trim()

  return {
    parser: 'fallback',
    intent: buildIntent(input.query, families, anchorText || input.query),
  }
}
