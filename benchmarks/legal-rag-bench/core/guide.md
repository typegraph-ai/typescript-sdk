# Legal RAG Bench — Core (Hybrid Search)

## Dataset

**Source:** [isaacus/legal-rag-bench](https://huggingface.co/datasets/isaacus/legal-rag-bench)

Victorian Criminal Charge Book passages with complex legal QA. Custom format (not BEIR).

| Split | Rows | Description |
|-------|------|-------------|
| corpus | 4,876 | Judicial College of Victoria Criminal Charge Book passages |
| qa | 100 | Complex legal questions with expected answers |

Each QA pair references a single `relevant_passage_id` in the corpus.

## Running

```bash
npx tsx --env-file=.env legal-rag-bench/core/run.ts --seed    # first run (4,876 docs)
npx tsx --env-file=.env legal-rag-bench/core/run.ts           # subsequent (query-only)
```

## What it measures

- Large-scale legal passage retrieval (4,876 docs — biggest benchmark)
- Complex legal reasoning questions (jury instructions, evidence standards, etc.)
- Includes footnotes in indexed content for richer retrieval
- Only 100 queries but each requires precise passage identification from a large corpus
