# Auto-Context Injection with d8um Memory

Automatically inject relevant memories into your LLM prompts using `d8umMemoryMiddleware` -- no tool loop required. The middleware enriches the system prompt with memory context before the LLM call, and ingests the conversation turn into memory after.

## Prerequisites

- Node.js 18+
- A [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) API key

## 1) Install

```bash
# d8um SDK + memory
npm install @d8um-ai/core @d8um-ai/graph @d8um-ai/adapter-sqlite-vec @d8um-ai/vercel-ai-provider

# Vercel AI SDK + provider
npm install ai @ai-sdk/gateway
```

## 2) Bind Identity and Create Middleware

Just like the tool loop approach, identity is set once at `d8umMemory` construction time. The middleware operates within this scope automatically.

```ts
import { d8umMemory, PgMemoryStoreAdapter } from '@d8um-ai/graph'
import { d8umMemoryMiddleware } from '@d8um-ai/vercel-ai-provider'

// Identity is deterministic — set by your application, not the LLM
const memory = new d8umMemory({
  memoryStore: new PgMemoryStoreAdapter({ connectionString: process.env.DATABASE_URL! }),
  embedding: { embed: async (text) => { /* your embedding call */ } },
  llm: { generateJSON: async (prompt) => { /* your LLM call */ } },
  scope: {
    tenantId: 'acme-corp',
    userId: 'user_alice',
  },
})

const middleware = d8umMemoryMiddleware(memory, {
  includeFacts: true,       // inject semantic facts (default: true)
  includeEpisodes: true,    // inject recent episodes (default: false)
  includeProcedures: false,  // skip procedural memories
  maxMemoryTokens: 2000,    // token budget for memory context
  format: 'xml',            // 'xml', 'markdown', or 'plain'
})
```

## 3) Enrich the System Prompt Before Calling the LLM

Use `enrichSystem()` to prepend memory context to your system prompt. The middleware searches memories relevant to the user's query and formats them for the LLM.

```ts
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'

const systemPrompt = 'You are a helpful assistant. Use any provided memory context to personalize your responses.'
const userMessage = 'Can you recommend a database for my new project?'

// Memory context is injected into the system prompt
const enrichedSystem = await middleware.enrichSystem(systemPrompt, userMessage)

const { text } = await generateText({
  model: gateway('openai/gpt-4o'),
  system: enrichedSystem,
  prompt: userMessage,
})

console.log(text)
// "Since you're a backend engineer at Acme Corp working with PostgreSQL,
//  I'd recommend sticking with PostgreSQL for your new project..."
```

### What the Enriched Prompt Looks Like

If Alice has stored facts from previous conversations, `enrichSystem()` prepends them:

```
You are a helpful assistant. Use any provided memory context to personalize your responses.

<memory>
<semantic_memory>
- Alice works at Acme Corp as a backend engineer
- Alice prefers PostgreSQL over MySQL
- Acme Corp uses Kubernetes for deployment
</semantic_memory>
<episodic_memory>
- Alice asked about database migration strategies last week
</episodic_memory>
</memory>
```

The LLM sees relevant memories as part of its system prompt -- no tool calls needed.

## 4) Ingest the Conversation Turn After the Response

After the LLM responds, use `afterResponse()` to extract and store memories from the conversation turn. This is how the memory builds up over time.

```ts
const { text } = await generateText({
  model: gateway('openai/gpt-4o'),
  system: enrichedSystem,
  prompt: userMessage,
})

// Store this conversation turn in memory
await middleware.afterResponse([
  { role: 'user', content: userMessage },
  { role: 'assistant', content: text },
])
```

`afterResponse()` uses the LLM extraction pipeline to:

1. Create an episodic memory of the conversation turn
2. Extract semantic facts (e.g., "Alice is starting a new project")
3. Check for contradictions with existing facts and resolve them

## 5) Complete Request/Response Cycle

Putting it all together in a request handler:

```ts
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { d8umMemory, PgMemoryStoreAdapter } from '@d8um-ai/graph'
import { d8umMemoryMiddleware } from '@d8um-ai/vercel-ai-provider'

const memoryStore = new PgMemoryStoreAdapter({
  connectionString: process.env.DATABASE_URL!,
})

const SYSTEM_PROMPT = 'You are a helpful assistant. Use memory context to personalize responses.'

async function handleMessage(userId: string, conversationId: string, userMessage: string) {
  // 1. Create a scoped memory instance for this user
  const memory = new d8umMemory({
    memoryStore,
    embedding: { embed: async (text) => { /* your embedding call */ } },
    llm: { generateJSON: async (prompt) => { /* your LLM call */ } },
    scope: { tenantId: 'acme-corp', userId, conversationId },
  })

  const middleware = d8umMemoryMiddleware(memory, {
    includeFacts: true,
    includeEpisodes: true,
    maxMemoryTokens: 2000,
  })

  // 2. Enrich system prompt with relevant memories
  const enrichedSystem = await middleware.enrichSystem(SYSTEM_PROMPT, userMessage)

  // 3. Generate response
  const { text } = await generateText({
    model: gateway('openai/gpt-4o'),
    system: enrichedSystem,
    prompt: userMessage,
  })

  // 4. Store conversation turn in memory for future recall
  await middleware.afterResponse([
    { role: 'user', content: userMessage },
    { role: 'assistant', content: text },
  ])

  return text
}
```

## When to Use Middleware vs Tools

| Approach | Best For | Identity Control | Agent Autonomy |
|----------|----------|-----------------|----------------|
| **Middleware** (this guide) | Context enrichment, personalization | Application-controlled | None -- automatic injection |
| **[Tool Loop](./tool-loop-agent.md)** | Agents that actively manage memory | Application-controlled | Agent decides what to remember/recall |
| **Both** | Full-featured memory agents | Application-controlled | Automatic context + active management |

**Use middleware when** the agent doesn't need to decide what to remember -- you want every response to be personalized with relevant memories, and every conversation turn automatically ingested.

**Use the tool loop when** the agent should actively decide what's worth remembering, or when the user explicitly asks the agent to remember or forget things.

**Combine both** for the richest experience -- middleware provides baseline context, tools let the agent actively manage its knowledge.

### Using Both Together

```ts
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { d8umMemoryTools } from '@d8um-ai/vercel-ai-provider'
import { d8umMemoryMiddleware } from '@d8um-ai/vercel-ai-provider'

const tools = d8umMemoryTools(memory)
const middleware = d8umMemoryMiddleware(memory)

const enrichedSystem = await middleware.enrichSystem(
  'You are a helpful assistant with memory.',
  userMessage,
)

const { text } = await generateText({
  model: gateway('openai/gpt-4o'),
  system: enrichedSystem,  // auto-injected context
  tools,                   // agent can also actively remember/recall
  maxSteps: 5,
  prompt: userMessage,
})

await middleware.afterResponse([
  { role: 'user', content: userMessage },
  { role: 'assistant', content: text },
])
```

## Middleware Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeWorking` | `boolean` | `true` | Include working memory buffer |
| `includeFacts` | `boolean` | `true` | Include semantic facts |
| `includeEpisodes` | `boolean` | `false` | Include episodic memories |
| `includeProcedures` | `boolean` | `false` | Include procedural memories |
| `maxMemoryTokens` | `number` | `2000` | Token budget for memory context |
| `format` | `'xml' \| 'markdown' \| 'plain'` | `'xml'` | Output format for injected context |

## Next Steps

- [Agentic Tool Loop](./tool-loop-agent.md) -- give the agent active memory management tools
- [Cognitive Memory Overview](../Agentic%20Memory/overview.md) -- deep dive into memory types, extraction, and consolidation
