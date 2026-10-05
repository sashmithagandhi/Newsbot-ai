# Newsbot-ai

Multi-newspaper intelligence. Ask a question about the news and get an answer synthesized from The Hindu, Times of India, Indian Express and NDTV, with each claim attributed to the paper that reported it.

**Live demo:** https://newsbot-ai.vercel.app

## What it does

- **Ask NewsBot.** Chat interface that retrieves the most relevant articles and answers with per-newspaper citations and key takeaways.
- **Compare coverage.** See how each newspaper framed the same story (for example, the Union Budget): focus, tone and key quotes side by side.
- **Archive search.** Filter by keyword, newspaper, category and date range.
- **Analytics dashboard.** Source, category and sentiment breakdowns.
- **Alerts, feedback and registration** flows, plus an advertising-agency marketplace view.

## How it works

1. An Express API serves articles, alerts, comparison, archive and analytics endpoints.
2. For a chat question, articles are ranked by a keyword relevance score over headline, description, tags and content.
3. The top matches go into a grounded prompt for Google Gemini, which answers only from the retrieved reports. If the primary model is busy or errors, it falls back to a second model.
4. With no API key, or if both models fail, the server returns a templated summary built from the retrieved articles, so the app still works.

## Project status

This is a working prototype, not a live news pipeline.

- Articles are a seeded sample set held in memory, not scraped or ingested live.
- Retrieval is keyword scoring, not embeddings.
- Analytics and telemetry figures are illustrative demo data.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Recharts · Motion · Express · Google Gemini (`@google/genai`)

## Run locally

```bash
npm install
cp .env.example .env   # add your GEMINI_API_KEY (optional)
npm run dev            # http://localhost:3000
```

## Next

- Live article ingestion from the four newspapers
- Embedding-based retrieval
- Persistent storage
