# BooksIntake

BooksIntake is an AI-assisted document and workflow workspace built with Next.js, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Configure OpenAI

Create an API key at [OpenAI API keys](https://platform.openai.com/api-keys), then add it to `.env.local`:

```env
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=
```

The key is used only by the server-side `/api/ai` route. Never use a `NEXT_PUBLIC_` prefix, commit `.env.local`, or place a key in browser code.

The Document Processing, Workflow Generator, and Email Assistant workspaces show an **AI ready** indicator once the key is available. Each request is made only after the user submits its content.

## Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Add `OPENAI_API_KEY` and `OPENAI_MODEL` under **Project Settings → Environment Variables**.
3. Keep `OPENAI_BASE_URL` blank for the official OpenAI API.
4. Deploy.

## OpenAI-compatible alternatives

The server supports an OpenAI-compatible endpoint through `OPENAI_BASE_URL`. For Ollama running on the same machine as the app:

```env
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://127.0.0.1:11434/v1
OPENAI_MODEL=qwen2.5:7b
```

`localhost` cannot reach a user’s computer from Vercel. A public web deployment needs an HTTPS-hosted, authenticated AI endpoint or a hosted API provider.

## Current persistence

Workflow drafts, local members, and the activity view are stored in the browser until Supabase authentication and database storage are connected. They are clearly identified as local workspace data in the interface.
