# @typegraph-ai/vercel-ai-provider

Vercel AI SDK integration -- memory tools and middleware for auto-context injection.

## Install

```bash
npm install @typegraph-ai/vercel-ai-provider
```

## Usage

### Tools

Pass memory tools directly to `generateText()`:

```ts
import { generateText } from 'ai'
import { typegraphMemoryTools } from '@typegraph-ai/vercel-ai-provider'

const tools = typegraphMemoryTools(memory)

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools,
  prompt: 'What do you know about Alice?',
})
```

### Middleware

Auto-inject memory context into prompts:

```ts
import { typegraphMemoryMiddleware } from '@typegraph-ai/vercel-ai-provider'

const middleware = typegraphMemoryMiddleware(memory, {
  includeFacts: true,
  includeEpisodes: true,
  maxMemoryTokens: 2000,
})

const enrichedPrompt = await middleware.enrichPrompt('What should Alice have for dinner?')
const enrichedSystem = await middleware.enrichSystem(systemPrompt, userQuery)
```

## API

| Export | Description |
|--------|-------------|
| `typegraphMemoryTools()` | Generate Vercel AI SDK-compatible tool definitions |
| `typegraphMemoryMiddleware()` | Create middleware for auto-context injection |

Pure structural typing -- no `ai` or `@ai-sdk/*` imports needed.

### Types

`ToolDefinition`, `MemoryMiddlewareOpts`

## Related

- [TypeGraph main repo](../../README.md)
- [@typegraph-ai/graph](../graph/README.md)
