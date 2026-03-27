# Australian Tax Guidance Retrieval — Neural (Graph Search)

## Dataset

Same as core — see [core/guide.md](../core/guide.md) for dataset details.

## Running

```bash
npx tsx --env-file=.env australian-tax-guidance-retrieval/neural/run.ts --seed
npx tsx --env-file=.env australian-tax-guidance-retrieval/neural/run.ts
```

## What it measures

- Neural search (hybrid + memory recall + PPR graph traversal) on legal/tax content
- LLM triple extraction during ingestion builds knowledge graph
- Tests whether graph-augmented retrieval improves over hybrid on specialized domains
