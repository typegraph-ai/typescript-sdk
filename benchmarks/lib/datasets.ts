/**
 * datasets.ts — Download BEIR datasets from Vercel Blob Storage
 *
 * Datasets are seeded once via scripts/seed-datasets.ts (HF Parquet → Blob).
 * These helpers fetch the cached JSON for use in benchmark scripts.
 */

import { list } from '@vercel/blob'

const BLOB_PREFIX = 'datasets/beir'

export interface BeirCorpusRow {
  _id: string
  title: string
  text: string
}

export interface BeirQueryRow {
  _id: string
  text: string
}

export interface BeirQrelRow {
  'query-id': string | number
  'corpus-id': string | number
  score: number
}

async function fetchBlobJson<T>(blobPath: string): Promise<T> {
  // List blobs to find the URL for this pathname
  const { blobs } = await list({ prefix: blobPath, limit: 1 })
  const blob = blobs.find(b => b.pathname === blobPath)
  if (!blob) {
    throw new Error(`Dataset not found in blob storage: ${blobPath}\nRun: npx tsx scripts/seed-datasets.ts`)
  }
  const res = await fetch(blob.downloadUrl)
  if (!res.ok) {
    throw new Error(`Failed to download ${blobPath}: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function loadCorpus(dataset: string): Promise<BeirCorpusRow[]> {
  console.log(`  Loading ${dataset}/corpus from blob storage...`)
  const rows = await fetchBlobJson<BeirCorpusRow[]>(`${BLOB_PREFIX}/${dataset}/corpus.json`)
  console.log(`  ✓ ${rows.length.toLocaleString()} corpus documents`)
  return rows
}

export async function loadQueries(dataset: string): Promise<BeirQueryRow[]> {
  console.log(`  Loading ${dataset}/queries from blob storage...`)
  const rows = await fetchBlobJson<BeirQueryRow[]>(`${BLOB_PREFIX}/${dataset}/queries.json`)
  console.log(`  ✓ ${rows.length.toLocaleString()} queries`)
  return rows
}

export async function loadQrels(dataset: string): Promise<BeirQrelRow[]> {
  console.log(`  Loading ${dataset}/qrels from blob storage...`)
  const rows = await fetchBlobJson<BeirQrelRow[]>(`${BLOB_PREFIX}/${dataset}/qrels.json`)
  console.log(`  ✓ ${rows.length.toLocaleString()} relevance judgments`)
  return rows
}

/**
 * Build the standard qrels lookup: queryId → Map<corpusId, relevance>
 */
export function buildQrelsMap(qrels: BeirQrelRow[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>()
  for (const qrel of qrels) {
    const queryId = String(qrel['query-id'])
    const corpusId = String(qrel['corpus-id'])
    const score = Number(qrel['score'])
    if (!map.has(queryId)) map.set(queryId, new Map())
    map.get(queryId)!.set(corpusId, score)
  }
  return map
}
