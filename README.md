# Activities & Events

Discover activities and events based on your preferences (location, interests) and list your own (e.g. Tennis – looking for players, Concert – extra tickets).

## Features

- **Preferences**: Set location and interests on the home page.
- **Discover**: Events from web search (scraped) plus community listings.
- **Create listing**: Post activities or events (tennis, concert, sports, hiking, other) with optional description and contact.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Python scraper (optional)

To run the Python scraper and get JSON for the same format:

```bash
pip install -r scripts/requirements-scrape.txt
python scripts/scrape_events.py "tennis" --location "San Francisco"
```

Output is JSON with an `events` array. The Next.js app uses a Node-based fetcher in production (Vercel) so no Python runtime is required on deploy.

## Deploy on Vercel

Push to GitHub and connect the repo in [Vercel](https://vercel.com). The app will build and deploy. User listings are stored in memory (resets on cold start); for persistence add Vercel KV or a database.
