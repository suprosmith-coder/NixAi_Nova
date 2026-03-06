# Cyanix AI ✦

> An AI chat assistant powered by Groq, integrated with Cysearch — a galaxy-mapped search engine built on Supabase Edge Functions.

---

## What it does

Cyanix AI is a chat interface where users can ask questions, get AI-generated answers, and automatically pull live search results from the web — all without a single API key exposed in the frontend.

When a user asks for tools, websites, tutorials, or recommendations, Cyanix quietly calls the **Cysearch** edge function in the background, fetches relevant results as galaxy nodes, and weaves them into the AI response. The user just sees a natural answer with clickable links.

---

## How it's built

```
User's browser
    │
    ├── Sends message to: /functions/v1/cyanix-chat  ← your Supabase edge function
    │       │
    │       ├── Calls Groq API using GROQ_API_KEY (stored in Supabase secrets)
    │       └── Returns { reply, nodes? }
    │
    └── Also calls: /functions/v1/search  ← Cysearch edge function
            │
            └── Returns { answer, nodes, connections }
```

**No API keys live in the frontend.** The browser only uses the public Supabase anon key, which is safe to expose.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| AI model | Groq (`llama-3.3-70b-versatile`) |
| Backend / Auth | Supabase Edge Functions |
| Search engine | Cysearch (your own `/functions/v1/search`) |
| Fonts | Inter, Orbitron, Share Tech Mono |

---

## Project structure

```
cyanix/
├── index.html       — Chat UI layout
├── style.css        — Dark theme styling
├── JavaScript.js    — All frontend logic
└── README.md        — You're reading it

cysearch/            — Companion app (separate folder, same repo)
├── index.html
├── style.css
└── JavaScript.js
```

---

## Supabase setup

### 1. Edge functions you need to deploy

**`cyanix-chat`** — handles all AI responses

```typescript
// supabase/functions/cyanix-chat/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { message, history, cysearch } = await req.json()

  const systemPrompt = `You are Cyanix AI, a friendly and helpful assistant.
You are integrated with Cysearch, a galaxy-mapped internet search engine.
When cysearch data is provided, use it to give accurate, sourced answers.
Be conversational, clear, and concise.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []),
    ...(cysearch ? [{
      role: 'user',
      content: `[Search results for context]: ${JSON.stringify(cysearch)}`
    }] : []),
    { role: 'user', content: message }
  ]

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7
    })
  })

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content || 'No response.'

  return new Response(JSON.stringify({ reply }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type'
    }
  })
})
```

**`search`** — your existing Cysearch edge function (already deployed).

---

### 2. Set your environment secret

In your Supabase dashboard go to **Project Settings → Edge Functions → Secrets** and add:

```
GROQ_API_KEY = gsk_your_key_here
```

Get a free Groq key at [console.groq.com](https://console.groq.com/keys).

---

### 3. Deploy the edge function

```bash
supabase functions deploy cyanix-chat
```

---

### 4. CORS (if you get blocked requests)

In your Supabase dashboard under **Edge Functions**, make sure your GitHub Pages URL is allowed, or handle OPTIONS preflight in your function:

```typescript
// Add this at the top of your serve() handler
if (req.method === 'OPTIONS') {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type'
    }
  })
}
```

---

## Deploying to GitHub Pages

Both Cyanix and Cysearch live in the same repo:

```
your-repo/
├── cyanix/
│   ├── index.html
│   ├── style.css
│   └── JavaScript.js
└── cysearch/
    ├── index.html
    ├── style.css
    └── JavaScript.js
```

1. Push to GitHub
2. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**
3. Your URLs will be:
   - `https://yourusername.github.io/your-repo/cyanix/`
   - `https://yourusername.github.io/your-repo/cysearch/`

---

## How the auto-search works

Cyanix detects certain keywords in the user's message and automatically calls Cysearch before sending to the AI:

```
User: "What are the best AI tools?"
         │
         ▼ (keyword "tools" detected)
Cysearch called → returns nodes
         │
         ▼
Groq called with nodes as context
         │
         ▼
AI replies with sourced answer + node pills shown in chat
```

Keywords that trigger a search: `tools`, `website`, `recommend`, `find`, `tutorial`, `resource`, `guide`, `platform`, `app`, `best`, `top`, and more.

---

## What Cyanix sends to your edge function

```json
{
  "message": "What are the best AI tools?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hey! How can I help?" }
  ],
  "cysearch": {
    "answer": "Here are some top AI tools...",
    "nodes": [
      { "label": "ChatGPT", "category": "ai", "url": "https://chat.openai.com", "description": "..." }
    ]
  }
}
```

What Cyanix expects back:

```json
{
  "reply": "Here are the best AI tools right now...",
  "nodes": []
}
```

---

## Supabase keys reference

| Key | Where it lives | Safe to expose? |
|---|---|---|
| `SUPABASE_URL` | `JavaScript.js` | ✅ Yes |
| `SUPABASE_ANON` | `JavaScript.js` | ✅ Yes |
| `GROQ_API_KEY` | Supabase Secrets | ❌ Never in frontend |

---

## Related

- **Cysearch** — [../cysearch/](../cysearch/) — The galaxy-mapped internet explorer that powers Cyanix's search results
- **Supabase** — [supabase.com](https://supabase.com) — Backend, auth, and edge functions
- **Groq** — [groq.com](https://groq.com) — Blazing fast LLM inference

---

*Built by Sarano Smith. Powered by Supabase + Groq. Searches the galaxy so you don't have to.*

