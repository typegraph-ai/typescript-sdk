# MLEB-SCALR — Core (Hybrid Search)

## Dataset

**Source:** [isaacus/mleb-scalr](https://huggingface.co/datasets/isaacus/mleb-scalr)

Multilingual Legal Embeddings Benchmark — Supreme Court legal holdings retrieval. Covers patent law, civil rights, constitutional law, employment law, bankruptcy, and environmental law.

| Split | Rows | Description |
|-------|------|-------------|
| corpus | 523 | Supreme Court legal holdings |
| queries | 120 | Legal questions presented to courts |
| qrels | 120 | Relevance judgments |

## Running

```bash
npx tsx --env-file=.env mleb-scalr/core/run.ts --seed
npx tsx --env-file=.env mleb-scalr/core/run.ts
```

## What it measures

- Legal reasoning retrieval at moderate scale
- Cross-domain legal retrieval (patent, civil rights, constitutional, etc.)
- The largest of the isaacus BEIR datasets — most representative of real-world workloads
