# Agentic Tool Loop with d8um Memory

Build an AI agent that autonomously remembers and recalls information using the Vercel AI SDK's tool loop (`maxSteps`) and d8um's memory tools.

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

## 2) Bind Identity at Construction Time

Identity determines whose memories the agent can read and write. It is set once when you create the `d8umMemory` instance -- the agent never decides its own scope.

```ts
import { d8umMemory, PgMemoryStoreAdapter } from '@d8um-ai/graph'
import { gateway } from '@ai-sdk/gateway'

// Identity is deterministic — set by your application, not the LLM
const memory = new d8umMemory({
  memoryStore: new PgMemoryStoreAdapter({ connectionString: process.env.DATABASE_URL! }),
  embedding: { embed: async (text) => { /* your embedding call */ } },
  llm: { generateJSON: async (prompt) => { /* your LLM call */ } },
  scope: {
    tenantId: 'acme-corp',    // organization
    userId: 'user_alice',     // current user
    agentId: 'support-bot',   // this agent
  },
})
```

**Why this matters:** Every `remember`, `recall`, `recallFacts`, and `correct` call through the tools is automatically scoped to this identity. Alice's memories are isolated from Bob's. The LLM cannot access or modify memories outside this scope -- it's enforced at the storage layer.

### Per-User Memory Instances

In a real application, create a `d8umMemory` instance per user session:

```ts
function createMemoryForUser(userId: string, conversationId: string) {
  return new d8umMemory({
    memoryStore,  // shared store
    embedding,    // shared embedding provider
    llm,          // shared LLM provider
    scope: {
      tenantId: 'acme-corp',
      userId,
      conversationId,
    },
  })
}

// In your request handler:
const memory = createMemoryForUser(req.user.id, req.params.conversationId)
```

## 3) Create Tools and Run the Agent

Pass `d8umMemoryTools(memory)` to `generateText` with `maxSteps` to enable the tool loop. The LLM can call memory tools across multiple reasoning steps.

```ts
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { d8umMemoryTools } from '@d8um-ai/vercel-ai-provider'

const tools = d8umMemoryTools(memory)

const { text, steps } = await generateText({
  model: gateway('openai/gpt-4o'),
  tools,
  maxSteps: 5,
  system: `You are a helpful assistant with memory. You can:
- Use "remember" to store important facts about the user
- Use "recall" to search your memories when answering questions
- Use "recallFacts" to look up specific known facts
- Use "correct" to fix incorrect memories

Always check your memory before answering questions about the user.`,
  prompt: 'My name is Alice and I work at Acme Corp as a backend engineer.',
})

console.log(text)
// "Nice to meet you, Alice! I've noted that you work at Acme Corp as a
//  backend engineer. How can I help you today?"

console.log(`Steps taken: ${steps.length}`)
// Steps taken: 3  (think → remember → respond)
```

### What Happens Under the Hood

1. The LLM reads the user message and decides to call `remember`
2. `remember` stores "Alice works at Acme Corp as a backend engineer" scoped to `{ tenantId: 'acme-corp', userId: 'user_alice', agentId: 'support-bot' }`
3. The tool result is fed back to the LLM
4. The LLM generates a final text response

The identity fields are never visible to the LLM -- they're applied automatically by the `d8umMemory` instance.

## 4) Multi-Turn Conversations

In a later conversation, the agent can recall stored memories:

```ts
const { text } = await generateText({
  model: gateway('openai/gpt-4o'),
  tools,
  maxSteps: 5,
  system: `You are a helpful assistant with memory.
Always check your memory before answering questions about the user.`,
  prompt: 'What do you know about me?',
})

console.log(text)
// "From my memory, I know that your name is Alice and you work at
//  Acme Corp as a backend engineer. Is there anything else you'd
//  like me to remember?"
```

The agent calls `recall` or `recallFacts` in its tool loop, retrieves Alice's stored facts, and synthesizes a response.

## 5) Memory Correction

The agent can correct outdated information:

```ts
const { text } = await generateText({
  model: gateway('openai/gpt-4o'),
  tools,
  maxSteps: 5,
  system: `You are a helpful assistant with memory.
When the user corrects information, use the "correct" tool to update your memories.`,
  prompt: 'Actually, I switched to frontend engineering last month.',
})

console.log(text)
// "Got it! I've updated my records — you're now a frontend engineer
//  at Acme Corp."
```

The `correct` tool invalidates the old fact ("backend engineer") and creates a new one ("frontend engineer"), preserving the full history with bi-temporal timestamps.

## Available Tools

| Tool | Description | When the Agent Uses It |
|------|-------------|----------------------|
| `remember` | Store a memory (episodic, semantic, or procedural) | User shares new information |
| `recall` | Search memories by semantic similarity | Agent needs context to answer |
| `recallFacts` | Search specifically for known facts (subject-predicate-object) | Agent needs structured knowledge |
| `correct` | Fix incorrect memories with natural language | User corrects outdated info |

## Identity Scoping Reference

| Field | Purpose | Example |
|-------|---------|---------|
| `tenantId` | Organization-level isolation | `'acme-corp'` |
| `groupId` | Team, channel, or project | `'team-backend'` |
| `userId` | Individual user | `'user_alice'` |
| `agentId` | Specific agent instance | `'support-bot'` |
| `conversationId` | Conversation session | `'conv_abc123'` |

All fields are optional. Use the combination that matches your isolation needs:

- **SaaS app**: `tenantId` + `userId` (isolate per org, then per user)
- **Team assistant**: `tenantId` + `groupId` (shared team memory)
- **Personal agent**: `userId` only (single-user, no multi-tenancy)
- **Session-scoped**: `userId` + `conversationId` (memory per conversation)

## Next Steps

- [Auto-Context Injection](./context-injection.md) -- inject memory into prompts without a tool loop
- [Cognitive Memory Overview](../Agentic%20Memory/overview.md) -- deep dive into memory types, extraction, and consolidation
