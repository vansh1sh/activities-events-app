#!/usr/bin/env python3
"""
Scrape events/activities from web search results.
Outputs JSON to stdout for use by the Next.js app.
Run: pip install requests beautifulsoup4
Usage: python scripts/scrape_events.py "tennis events San Francisco"
"""

import json
import sys
import urllib.parse
import re

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print(json.dumps({"error": "Install: pip install requests beautifulsoup4", "events": []}))
    sys.exit(1)


def scrape_events_from_search(query, location="", max_results=15):
    """Fetch event-like results from a public events listing or search."""
    events = []
    # Use DuckDuckGo HTML (no API key, more permissive than Google) for event-style queries
    base = "https://html.duckduckgo.com/html/"
    full_query = f"{query} events {location}".strip() if location else f"{query} events"
    payload = {"q": full_query}
    headers = {"User-Agent": "Mozilla/5.0 (compatible; EventsBot/1.0)"}

    try:
        r = requests.get(base, params=payload, headers=headers, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        results = soup.select(".result__body")[:max_results]

        for i, node in enumerate(results):
            title_el = node.select_one(".result__title a")
            snippet_el = node.select_one(".result__snippet")
            link_el = node.select_one(".result__url")
            title = title_el.get_text(strip=True) if title_el else ""
            snippet = snippet_el.get_text(strip=True) if snippet_el else ""
            url = title_el.get("href", "") if title_el else (link_el.get_text(strip=True) if link_el else "")
            if title:
                events.append({
                    "id": f"scraped-{i}",
                    "title": title,
                    "description": snippet[:200] if snippet else "",
                    "source": "web",
                    "url": url or "#",
                    "category": query,
                })
    except Exception as e:
        events = [{"id": "error", "title": "Scrape unavailable", "description": str(e), "source": "web", "url": "#", "category": query}]

    return {"events": events, "query": full_query}


def main():
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "activities"
    location = ""
    if "--location" in sys.argv:
        idx = sys.argv.index("--location")
        if idx + 1 < len(sys.argv):
            location = sys.argv[idx + 1]
    out = scrape_events_from_search(query, location=location)
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
