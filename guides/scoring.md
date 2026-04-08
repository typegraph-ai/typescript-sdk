# Scoring & Ranking

This guide explains how d8um scores, normalizes, and ranks retrieval results across all active signals.

## Scoring Categories

Every query result is scored across up to four independent categories. Each measures a different dimension of relevance:

| Category | Algorithm | Raw Range | What It Measures |
|----------|-----------|-----------|------------------|
| **Semantic** | Cosine similarity | 0-1 | How close the result's embedding is to the query embedding. Used by both indexed chunks and memory recall. |
| **Keyword** | BM25 | 0-unbounded (normalized to 0-1) | Lexical term overlap. Catches exact matches that embeddings miss ("Alice's phone number"). |
| **Graph** | Personalized PageRank (PPR) | 0-1 (normalized by damping factor) | How connected the result is to query-relevant entities through the knowledge graph. Measures structural relationship relevance, not just textual similarity. |
| **Memory** | Composite (similarity + importance + recency) | 0-1 | Overall memory relevance combining embedding match, LLM-judged importance, and time decay. |

### Semantic is universal

Both indexed chunks and memories use embedding cosine similarity. When a memory is recalled, its cosine similarity score populates the `semantic` normalized score, the same way an indexed chunk's does. This means semantic scoring is consistent across result types.

### Graph is a scoring category, not a ranking technique

PPR produces a per-result relevance score measuring entity-query connectedness through the knowledge graph. Unlike RRF (which combines ranked lists by position), PPR measures something meaningful about the relationship between query entities and content. Graph is a first-class scoring category alongside semantic, keyword, and memory.

### RRF is a merge-time technique

Reciprocal Rank Fusion (RRF) combines ranked lists from different runners (indexed, memory, graph) into a single ordering. It's used as a tiebreaker during merge, **not** as a component of the composite score. RRF appears in `scores.raw.rrf` and `scores.normalized.rrf` for observability, but does not affect the top-level `score` unless explicitly included via `scoreWeights`.

## Composite Score Formula

The top-level `score` on each result is a weighted combination of its normalized category scores:

```
score = w_semantic * semantic + w_keyword * keyword + w_graph * graph + w_memory * memory
```

Weights are determined by which signals are active (see [Default Weight Profiles](#default-weight-profiles)) or by explicit `scoreWeights` in `QueryOpts`.

### Eligible vs Ineligible

A critical distinction the scoring system enforces:

- **Ineligible** (`undefined`): The result cannot have this score by nature. Example: a bucket document has no memory score. Its weight is **redistributed** proportionally to eligible categories. No penalty.
- **Scored 0** (`0`): The result IS eligible but scored poorly. Example: a memory with zero keyword match. Its weight is **applied as 0**. Full penalty proportional to the category weight.

This ensures bucket documents aren't penalized for lacking memory scores, while memories that genuinely score 0 in keyword search are properly penalized.

**Redistribution formula:**

```typescript
// For each eligible component:
adjustedWeight = weight + ineligibleWeight * (weight / eligibleTotalWeight)
score += adjustedWeight * value
```

**Example:** A bucket document in a `{ semantic: true, memory: true }` query (weights: semantic=0.55, memory=0.45):
- `semantic = 0.8` (eligible, scored well)
- `memory = undefined` (ineligible -- it's a bucket document, not a memory)
- Memory's 0.45 weight redistributes to semantic
- Final: `1.0 * 0.8 = 0.80`

A memory result in the same query:
- `semantic = 0.6` (eligible -- memories use cosine similarity too)
- `memory = 0.9` (eligible, scored well)
- Both eligible, no redistribution
- Final: `0.55 * 0.6 + 0.45 * 0.9 = 0.735`

## Default Weight Profiles

When no explicit `scoreWeights` are provided, weights are derived from which signals are active:

| Active Signals | semantic | keyword | graph | memory |
|----------------|----------|---------|-------|--------|
| semantic only | 1.00 | - | - | - |
| semantic + keyword | 0.85 | 0.15 | - | - |
| semantic + graph | 0.55 | - | 0.45 | - |
| semantic + memory | 0.55 | - | - | 0.45 |
| semantic + keyword + graph | 0.45 | 0.10 | 0.45 | - |
| semantic + keyword + memory | 0.45 | 0.10 | - | 0.45 |
| semantic + graph + memory | 0.35 | - | 0.35 | 0.30 |
| all signals | 0.35 | 0.05 | 0.30 | 0.30 |
| graph only | - | - | 1.00 | - |
| memory only | - | - | - | 1.00 |
| graph + memory | - | - | 0.50 | 0.50 |

## Memory Scoring

Memory results use a composite score combining three sub-signals:

```
memoryScore = 0.55 * similarity + 0.30 * importance + 0.15 * recency
```

| Sub-signal | Source | Range | Description |
|------------|--------|-------|-------------|
| **Similarity** | Cosine similarity from vector search | 0-1 | How close the memory embedding is to the query. Also populates `semantic` normalized score. |
| **Importance** | LLM-judged at remember-time | 0-1 | How significant the memory is (set by `importance` field on the memory record). Defaults to 0.5. |
| **Recency** | Exponential time decay | 0-1 | How recently the memory was accessed or created. Half-life of 7 days. |

### Recency decay

Recency uses exponential decay:

```
recency = exp(-(ln2 / halfLife) * ageMs)
```

- `halfLife` = 7 days (604,800,000 ms)
- `ageMs` = time since `lastAccessedAt` (or `createdAt` if never accessed)
- Score = 1.0 for just-accessed memories, ~0.5 at 7 days, ~0.25 at 14 days

All three sub-signals are exposed in `scores.raw` for observability: `memorySimilarity`, `memoryImportance`, `memoryRecency`.

### Hybrid memory search

When both `memory` and `keyword` signals are active, memory recall uses hybrid search (vector + BM25 RRF fusion) if the graph bridge supports it. This catches exact-match queries against memories that embedding similarity alone might miss.

## BM25 Normalization

BM25 scores are unbounded and query-length-dependent, making them not directly comparable across queries. Within a result set, BM25 scores are max-normalized: each score is divided by the maximum BM25 score in the set, producing values in 0-1.

This is not perfectly cross-query comparable (IDF varies), but it's bounded and comparable within a query.

## Customization

### `scoreWeights`

Override the default weight profile with explicit per-category weights:

```typescript
const response = await d.query('What is quantum computing?', {
  signals: { semantic: true, keyword: true, graph: true },
  scoreWeights: { semantic: 0.6, keyword: 0.3, graph: 0.1 },
})
```

Weight values don't need to sum to 1.0 -- the eligible/ineligible redistribution handles normalization. But keeping them proportional makes the intent clear.

### `autoWeights`

Opt-in automatic weight adjustment based on query type classification:

```typescript
const response = await d.query('Who founded OpenAI?', {
  signals: { semantic: true, keyword: true, graph: true, memory: true },
  autoWeights: true,
})
```

When `autoWeights: true` and no explicit `scoreWeights`, the query planner classifies the query and applies a type-specific weight profile:

| Query Type | Indicators | sem | kw | graph | mem |
|------------|-----------|------|------|-------|------|
| **factual-lookup** | "what is", "who is", exact terms | 0.40 | 0.25 | 0.05 | 0.30 |
| **entity-centric** | "tell me about", proper nouns | 0.30 | 0.10 | 0.45 | 0.15 |
| **relational** | "connect", "between", 2+ entities | 0.20 | 0.05 | 0.65 | 0.10 |
| **temporal** | "recent", "last week", "when" | 0.30 | 0.10 | 0.15 | 0.45 |
| **exploratory** | Default fallback | 0.45 | 0.05 | 0.25 | 0.25 |

Classification is pure heuristics (regex patterns + entity detection), sub-millisecond, no LLM call. User-provided `scoreWeights` always override `autoWeights`.

### `graphReinforcement`

Controls how graph results interact with indexed results:

| Value | Behavior |
|-------|----------|
| `'only'` (default) | Keep graph results only if they also appear in indexed results |
| `'prefer'` | Boost matching results, but keep novel graph results at lower weight |
| `'off'` | Include all graph results as-is |

## Result Score Structure

Every `d8umResult` contains:

```typescript
{
  // Top-level composite score (0-1)
  score: 0.82,

  scores: {
    // Algorithm-level, original ranges
    raw: {
      cosineSimilarity: 0.85,  // from vector search
      bm25: 12.4,              // unbounded BM25
      rrf: 0.0164,             // reciprocal rank fusion
      ppr: 0.12,               // personalized pagerank
      // Memory sub-signals (only present for memory results)
      memorySimilarity: 0.75,
      memoryImportance: 0.9,
      memoryRecency: 0.62,
    },

    // Category-level, all 0-1
    // undefined = ineligible (weight redistributed)
    // 0 = eligible but scored poorly (penalized)
    normalized: {
      semantic: 0.85,
      keyword: 0.71,
      graph: 0.34,
      memory: undefined,  // this is a bucket document, not a memory
      rrf: 0.98,           // observability only, not in composite
    }
  },

  // Which retrieval systems contributed
  sources: ['indexed', 'graph'],

  // ... document, chunk, metadata fields
}
```

## Scoring Examples

### Semantic-only query

```typescript
await d.query('machine learning basics', { signals: { semantic: true } })
```

- Weights: `{ semantic: 1.0 }`
- Composite: `score = 1.0 * semantic`
- Simple cosine similarity ranking.

### Hybrid query (semantic + keyword)

```typescript
await d.query('RFC 7231 HTTP status codes', {
  signals: { semantic: true, keyword: true },
})
```

- Weights: `{ semantic: 0.85, keyword: 0.15 }`
- Result with `semantic: 0.7, keyword: 0.95`: score = `0.85 * 0.7 + 0.15 * 0.95 = 0.738`
- Result with `semantic: 0.9, keyword: 0.0`: score = `0.85 * 0.9 + 0.15 * 0.0 = 0.765`
- Keyword boosts exact matches but semantic still dominates.

### Full neural query (all signals)

```typescript
await d.query('How does Alice know Bob?', {
  signals: { semantic: true, keyword: true, graph: true, memory: true },
})
```

- Weights: `{ semantic: 0.35, keyword: 0.05, graph: 0.30, memory: 0.30 }`
- Indexed chunk (eligible: semantic, keyword; ineligible: graph, memory):
  - `semantic: 0.8, keyword: 0.3, graph: undefined, memory: undefined`
  - Ineligible weight (0.30 + 0.30 = 0.60) redistributes to semantic (0.35) and keyword (0.05)
  - Adjusted: semantic = `0.35 + 0.60 * (0.35/0.40) = 0.875`, keyword = `0.05 + 0.60 * (0.05/0.40) = 0.125`
  - Score: `0.875 * 0.8 + 0.125 * 0.3 = 0.7375`
- Memory result (eligible: semantic, memory; ineligible: keyword, graph):
  - `semantic: 0.6, keyword: undefined, graph: undefined, memory: 0.95`
  - Ineligible weight redistributes to semantic and memory
  - Score: `0.55 * 0.6 + 0.45 * 0.95 = 0.7575`
- The highly relevant memory outranks the indexed chunk despite lower semantic similarity, because its memory score is very high.

### Custom weights for keyword-heavy search

```typescript
await d.query('error code E-4021', {
  signals: { semantic: true, keyword: true },
  scoreWeights: { semantic: 0.3, keyword: 0.7 },
})
```

- Overrides default 85/15 split to heavily favor exact keyword matches.
- Useful for error codes, IDs, and other exact-match queries.

## Cross-Query Comparability

| Signal | Cross-query comparable? | Notes |
|--------|------------------------|-------|
| Semantic (cosine) | Yes | Bounded 0-1, consistent across queries |
| Keyword (BM25) | Approximately | Max-normalized within result set; IDF varies across queries |
| Graph (PPR) | Yes | Normalized by damping factor, consistent |
| Memory | Yes | Composite of 0-1 sub-signals, bounded by construction |
| Composite | Yes | Weighted combination of normalized 0-1 signals |

A composite score of 0.8 from query A and 0.8 from query B indicate roughly equal relevance to their respective queries. This enables score-based filtering ("only results above 0.5"), mixing results from different queries, and meaningful quality thresholds.
