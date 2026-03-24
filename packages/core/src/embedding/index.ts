export type { EmbeddingProvider } from './provider.js'

export { aiSdkEmbeddingProvider, isAISDKEmbeddingInput } from './ai-sdk-adapter.js'
export type { AISDKEmbeddingModel, AISDKEmbeddingInput } from './ai-sdk-adapter.js'

/** @deprecated Use AI SDK providers instead. */
export { OpenAIEmbedding } from './openai.js'
/** @deprecated Use AI SDK providers instead. */
export type { OpenAIEmbeddingConfig } from './openai.js'
/** @deprecated Use AI SDK providers instead. */
export { CohereEmbedding } from './cohere.js'
/** @deprecated Use AI SDK providers instead. */
export type { CohereEmbeddingConfig } from './cohere.js'
