# License TLDR Retrieval — Core (Hybrid Search)

## Dataset

**Source:** [isaacus/license-tldr-retrieval](https://huggingface.co/datasets/isaacus/license-tldr-retrieval)

Software license document retrieval — match TLDR descriptions to full license texts. Covers EUPL, BSD, Apache, GPL, Creative Commons, MIT, and proprietary licenses.

| Split | Rows | Description |
|-------|------|-------------|
| corpus | 65 | Full license documents |
| queries | 65 | TLDR summaries/descriptions |
| qrels | 65 | 1:1 perfect-match judgments |

## Running

```bash
npx tsx --env-file=.env license-tldr-retrieval/core/run.ts --seed
npx tsx --env-file=.env license-tldr-retrieval/core/run.ts
```

## What it measures

- Summary-to-full-text matching (asymmetric retrieval)
- Small corpus with 1:1 matching — precision-focused
- Tests whether TypeGraph can bridge the abstraction gap between TLDR and legalese
