# Newsbot-ai

> Multi-newspaper intelligence for asking, comparing and exploring news coverage.

Newsbot-ai is a working prototype that synthesizes reports from The Hindu, Times of India, Indian Express and NDTV. It retrieves relevant articles and uses them as context for AI-generated answers, with the source newspaper attributed to each result.

## Product idea

Following the same story across multiple news sources is time-consuming. Newsbot-ai explores whether a single interface can help users:

- Ask questions about a story
- Compare how different newspapers cover the same event
- Search an article archive
- Explore source, category and sentiment views

**Live demo:** https://newsbot-ai.vercel.app

## Core experience

**Ask → Retrieve → Ground → Explain**

1. A user asks a question about the news.
2. Relevant articles are ranked using keyword relevance across headline, description, tags and content.
3. The top matches are passed to Google Gemini as context.
4. The response is presented with newspaper-level attribution and key takeaways.
5. If the AI model is unavailable, the prototype falls back to a templated summary from retrieved articles.

## Product decisions

- **Source attribution:** keeps the origin of reporting visible instead of presenting a blended answer without context.
- **Keyword retrieval:** keeps the prototype simple and explainable while the product concept is being explored.
- **Fallback response:** preserves a usable experience when an AI API is unavailable.
- **Seeded data:** makes the prototype demonstrable without pretending it is a live news-ingestion system.

## Project status

**Working prototype — not a live news pipeline.**

- Articles are a seeded sample set held in memory.
- Retrieval currently uses keyword scoring, not embeddings.
- Analytics and telemetry figures are illustrative demo data.
- Live article ingestion and persistent storage are not implemented yet.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Recharts · Motion · Express · Google Gemini (`@google/genai`)

## Run locally

```bash
npm install
cp .env.example .env
# Add GEMINI_API_KEY if you want AI-generated responses
npm run dev
```

## Next

- Live article ingestion
- Embedding-based retrieval
- Persistent storage
- Evaluation of retrieval quality and answer grounding

## What I learned

Newsbot-ai helped me explore a core AI product question: how do you make generated answers useful while keeping the underlying sources visible and the prototype honest about its limitations?

## Feedback

If you try the prototype, feedback on retrieval quality, source attribution or the user experience is welcome through GitHub Issues.