# Contractual Clause Retrieval — Core (Hybrid Search)

## Dataset

**Source:** [isaacus/contractual-clause-retrieval](https://huggingface.co/datasets/isaacus/contractual-clause-retrieval)

Legal contractual clause matching — given a clause type description, retrieve the corresponding contractual passage.

| Split | Rows | Description |
|-------|------|-------------|
| corpus | 90 | Contractual clause passages |
| queries | 45 | Clause type descriptions |
| qrels | 90 | Perfect-match relevance judgments (all score 1.0) |

## Running

```bash
npx tsx --env-file=.env contractual-clause-retrieval/core/run.ts --seed
npx tsx --env-file=.env contractual-clause-retrieval/core/run.ts
```

## What it measures

- Precise clause matching: employment, IP assignment, termination, set-off, etc.
- All relevance scores are 1.0 — tests exact matching capability
- Multiple corpus docs per query (2:1 ratio) — tests ranking quality
