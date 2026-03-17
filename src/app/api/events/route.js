import { NextResponse } from "next/server";

// In production we could run the Python script or call an external scraper.
// Here we fetch event-like results from a public HTML search (DuckDuckGo) so it works on Vercel.
async function fetchScrapedEvents(query, location) {
  const q = [query, "events", location].filter(Boolean).join(" ");
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; EventsBot/1.0)" },
      next: { revalidate: 300 },
    });
    const html = await res.text();
    const events = [];
    const titleRegex = /class="result__title"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /class="result__snippet"[^>]*>([\s\S]*?)<\/div>/gi;
    let m;
    const titles = [];
    while ((m = titleRegex.exec(html)) !== null) {
      titles.push({ url: m[1], title: m[2].replace(/<[^>]+>/g, "").trim() });
    }
    const snippets = [];
    while ((m = snippetRegex.exec(html)) !== null) {
      snippets.push(m[1].replace(/<[^>]+>/g, "").trim());
    }
    titles.slice(0, 15).forEach((t, i) => {
      events.push({
        id: `scraped-${i}`,
        title: t.title,
        description: snippets[i] || "",
        source: "web",
        url: t.url || "#",
        category: query,
      });
    });
    return events;
  } catch (e) {
    return [];
  }
}

const FALLBACK_EVENTS = [
  { id: "f1", title: "Local tennis meetup", description: "Casual tennis, all levels.", source: "sample", url: "#", category: "tennis" },
  { id: "f2", title: "Concert in the park", description: "Free outdoor concert this Saturday.", source: "sample", url: "#", category: "concert" },
  { id: "f3", title: "Weekend hiking group", description: "Trail hike, 5 miles. Bring water.", source: "sample", url: "#", category: "hiking" },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "activities";
  const location = searchParams.get("location") || "";
  let events = await fetchScrapedEvents(query, location);
  if (events.length === 0) events = FALLBACK_EVENTS.map((e, i) => ({ ...e, id: `fallback-${i}`, category: query }));
  return NextResponse.json({ events, query: [query, "events", location].filter(Boolean).join(" ") });
}
