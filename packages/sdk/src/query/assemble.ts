import type { QueryChunkResult, QueryResults } from '../types/query.js'

export interface AssembleOpts {
  format?: 'xml' | 'markdown' | 'plain' | ((results: QueryResults) => string)
  citeBuckets?: boolean
}

export function assemble(results: QueryResults, opts: AssembleOpts = {}): string {
  const {
    format = 'xml',
    citeBuckets = true,
  } = opts

  if (typeof format === 'function') return format(results)

  switch (format) {
    case 'xml': return assembleXml(results, { citeBuckets })
    case 'markdown': return assembleMarkdown(results, { citeBuckets })
    case 'plain': return assemblePlain(results)
    default: return assembleXml(results, { citeBuckets })
  }
}

export function assembleXml(results: QueryResults, _opts: { citeBuckets: boolean }): string {
  const sections: string[] = []

  if (results.chunks.length > 0) {
    const sources = groupByBucketId(results.chunks)
    const sourceXml = Object.entries(sources).map(([bucketId, chunks]) => {
      const first = chunks[0]!
      const attrs = [
        `id="${bucketId}"`,
        first.document.title ? `title="${escapeXml(first.document.title)}"` : '',
        first.document.url ? `url="${escapeXml(first.document.url)}"` : '',
      ].filter(Boolean).join(' ')

      const passages = chunks.map(c =>
        `    <passage score="${c.score.toFixed(4)}">\n      ${escapeXml(c.content)}\n    </passage>`
      ).join('\n')

      return `  <source ${attrs}>\n${passages}\n  </source>`
    }).join('\n')
    sections.push(`<chunks>\n${sourceXml}\n</chunks>`)
  }

  if (results.facts.length > 0) {
    sections.push(`<facts>\n${results.facts.map(fact => {
      const attrs = [
        `id="${escapeXml(fact.id)}"`,
        `relation="${escapeXml(fact.relation)}"`,
        fact.sourceEntityName ? `source="${escapeXml(fact.sourceEntityName)}"` : '',
        fact.targetEntityName ? `target="${escapeXml(fact.targetEntityName)}"` : '',
        `weight="${fact.weight.toFixed(4)}"`,
      ].filter(Boolean).join(' ')
      return `  <fact ${attrs}>${escapeXml(fact.factText)}</fact>`
    }).join('\n')}\n</facts>`)
  }

  if (results.entities.length > 0) {
    sections.push(`<entities>\n${results.entities.map(entity => {
      const attrs = [
        `id="${escapeXml(entity.id)}"`,
        `type="${escapeXml(entity.entityType)}"`,
        `edgeCount="${entity.edgeCount}"`,
      ].join(' ')
      return `  <entity ${attrs}>${escapeXml(entity.name)}</entity>`
    }).join('\n')}\n</entities>`)
  }

  if (results.memories.length > 0) {
    sections.push(`<memories>\n${results.memories.map(memory => {
      const attrs = [
        `id="${escapeXml(memory.id)}"`,
        `category="${escapeXml(memory.category)}"`,
        `status="${escapeXml(memory.status)}"`,
        `score="${memory.score.toFixed(4)}"`,
      ].join(' ')
      return `  <memory ${attrs}>${escapeXml(memory.content)}</memory>`
    }).join('\n')}\n</memories>`)
  }

  return `<context>\n${sections.join('\n')}\n</context>`
}

export function assembleMarkdown(results: QueryResults, _opts: { citeBuckets: boolean }): string {
  const sections: string[] = []
  if (results.chunks.length > 0) {
    sections.push([
      '# Chunks',
      results.chunks.map(r => {
        const title = r.document.title
        const url = r.document.url
        const heading = url ? `## [${title}](${url})` : `## ${title}`
        return `${heading}\n${r.content}`
      }).join('\n\n---\n\n'),
    ].join('\n\n'))
  }
  if (results.facts.length > 0) {
    sections.push(['# Facts', results.facts.map(fact => `- ${fact.factText}`).join('\n')].join('\n\n'))
  }
  if (results.entities.length > 0) {
    sections.push(['# Entities', results.entities.map(entity => `- ${entity.name} (${entity.entityType})`).join('\n')].join('\n\n'))
  }
  if (results.memories.length > 0) {
    sections.push(['# Memories', results.memories.map(memory => `- ${memory.content}`).join('\n')].join('\n\n'))
  }
  return sections.join('\n\n---\n\n')
}

export function assemblePlain(results: QueryResults): string {
  const sections: string[] = []
  if (results.chunks.length > 0) sections.push(results.chunks.map(r => r.content).join('\n\n'))
  if (results.facts.length > 0) sections.push(`Facts:\n${results.facts.map(fact => `- ${fact.factText}`).join('\n')}`)
  if (results.entities.length > 0) sections.push(`Entities:\n${results.entities.map(entity => `- ${entity.name} (${entity.entityType})`).join('\n')}`)
  if (results.memories.length > 0) sections.push(`Memories:\n${results.memories.map(memory => `- ${memory.content}`).join('\n')}`)
  return sections.join('\n\n')
}

export function groupByBucketId(results: QueryChunkResult[]): Record<string, QueryChunkResult[]> {
  return results.reduce((acc, r) => {
    const key = r.document.bucketId
    ;(acc[key] = acc[key] ?? []).push(r)
    return acc
  }, {} as Record<string, QueryChunkResult[]>)
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
