import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Prefer events from our local JSON "DB" if present.
function readEventsFromDb(query, location) {
  try {
    const filePath = path.join(process.cwd(), "data", "events.json");
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    let events = Array.isArray(parsed.events) ? parsed.events : [];

    if (!events.length) return null;

    const q = (query || "").toLowerCase();
    const loc = (location || "").toLowerCase();

    events = events.filter((e) => {
      const title = (e.title || "").toLowerCase();
      const desc = (e.description || "").toLowerCase();
      const city = (e.city || "").toLowerCase();
      const matchesQuery =
        !q || title.includes(q) || desc.includes(q) || (e.category || "").toLowerCase().includes(q);
      const matchesLocation = !loc || city.includes(loc) || desc.includes(loc) || title.includes(loc);
      return matchesQuery && matchesLocation;
    });

    // Sort by date when available, otherwise keep order.
    events.sort((a, b) => {
      const da = a.date || a.dateISO;
      const db = b.date || b.dateISO;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return new Date(da) - new Date(db);
    });

    if (!events.length) return null;

    return {
      events,
      query: [query, "events", location].filter(Boolean).join(" "),
      source: "db",
    };
  } catch {
    return null;
  }
}

// Fallback: fetch event-like results from a public HTML search (DuckDuckGo) so it works on Vercel.
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

  // 1) Try local DB first (populated by Python BeautifulSoup scraper).
  const dbResult = readEventsFromDb(query, location);
  if (dbResult) {
    return NextResponse.json({
      events: dbResult.events.map((e, i) => ({
        id: e.id || `db-${i}`,
        source: "db",
        ...e,
      })),
      query: dbResult.query,
      usedDb: true,
    });
  }

  // 2) Fallback to on-demand HTML search scraping for environments without the Python job.
  let events = await fetchScrapedEvents(query, location);
  if (events.length === 0) {
    events = FALLBACK_EVENTS.map((e, i) => ({
      ...e,
      id: `fallback-${i}`,
      category: query,
    }));
  }
  return NextResponse.json({
    events,
    query: [query, "events", location].filter(Boolean).join(" "),
    usedDb: false,
  });
}
