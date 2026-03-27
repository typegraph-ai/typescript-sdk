# Legal RAG Bench — Neural (Graph Search)

## Dataset

Same as core — see [core/guide.md](../core/guide.md) for dataset details.

## Running

```bash
npx tsx --env-file=.env legal-rag-bench/neural/run.ts --seed
npx tsx --env-file=.env legal-rag-bench/neural/run.ts
```

## What it measures

- Graph-augmented retrieval on a large legal corpus (4,876 passages)
- Whether entity/relationship extraction from criminal law text improves retrieval
- Most expensive benchmark to run (4,876 docs × LLM triple extraction)
