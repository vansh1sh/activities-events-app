#!/usr/bin/env python3
"""
Scrape events/activities from web search results and write them into data/events.json
for the Next.js app to use as its local "DB".

Run once or on a schedule:
  pip install -r scripts/requirements-scrape.txt
  python scripts/scrape_events.py "tennis, concerts, hiking" --location "San Francisco"
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print(
        json.dumps(
            {
                "error": "Install dependencies first: pip install -r scripts/requirements-scrape.txt",
                "events": [],
            }
        )
    )
    sys.exit(1)


def scrape_events_from_search(query, location: str = "", max_results: int = 20):
    """Fetch event-like results from a public events listing or search."""
    events = []
    base = "https://html.duckduckgo.com/html/"
    full_query = f"{query} events {location}".strip() if location else f"{query} events"
    params = {"q": full_query}
    headers = {"User-Agent": "Mozilla/5.0 (compatible; EventsBot/1.0)"}

    try:
        r = requests.get(base, params=params, headers=headers, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        results = soup.select(".result__body")[:max_results]

        today = datetime.utcnow().date()

        for i, node in enumerate(results):
            title_el = node.select_one(".result__title a")
            snippet_el = node.select_one(".result__snippet")
            link_el = node.select_one(".result__url")
            title = title_el.get_text(strip=True) if title_el else ""
            snippet = snippet_el.get_text(strip=True) if snippet_el else ""
            url = title_el.get("href", "") if title_el else (link_el.get_text(strip=True) if link_el else "")
            if not title:
                continue

            # Heuristic: space results out over the next N days so the calendar
            # view can sort and group them.
            event_date = today + timedelta(days=i % 10)

            events.append(
                {
                    "id": f"scraped-{i}",
                    "title": title,
                    "description": snippet[:300] if snippet else "",
                    "source": "web",
                    "url": url or "#",
                    "category": query,
                    "city": location,
                    "date": event_date.isoformat(),
                }
            )
    except Exception as e:  # noqa: BLE001
        events = [
            {
                "id": "error",
                "title": "Scrape unavailable",
                "description": str(e),
                "source": "web",
                "url": "#",
                "category": query,
                "city": location,
                "date": datetime.utcnow().date().isoformat(),
            }
        ]

    return {"events": events, "query": full_query, "location": location}


def main():
    # Accept a comma-separated set of topics, we will scrape for the first one
    # and tag the rest as categories.
    raw_query = " ".join(arg for arg in sys.argv[1:] if not arg.startswith("--")) or "activities"
    topics = [s.strip() for s in raw_query.split(",") if s.strip()]
    query = topics[0] if topics else "activities"

    location = ""
    if "--location" in sys.argv:
        idx = sys.argv.index("--location")
        if idx + 1 < len(sys.argv):
            location = sys.argv[idx + 1]

    out = scrape_events_from_search(query, location=location)

    # If the user wants to just see JSON in the terminal, they can redirect stdout,
    # but by default we also write to data/events.json so the Next.js API can read it.
    project_root = Path(__file__).resolve().parents[1]
    data_dir = project_root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    target = data_dir / "events.json"
    target.write_text(json.dumps(out, indent=2), encoding="utf-8")

    print(json.dumps({"written_to": str(target), "count": len(out["events"])}, indent=2))


if __name__ == "__main__":
    main()
