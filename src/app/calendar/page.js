"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function groupEventsByDate(events) {
  const groups = new Map();

  for (const e of events) {
    const key = e.date || e.dateISO || null;
    const groupKey = key || "unscheduled";
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(e);
  }

  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === "unscheduled") return 1;
    if (b === "unscheduled") return -1;
    return new Date(a) - new Date(b);
  });

  return sortedKeys.map((key) => ({
    key,
    label:
      key === "unscheduled"
        ? "No specific date"
        : new Date(key).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
    events: groups.get(key) ?? [],
  }));
}

export default function CalendarPage() {
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocation(localStorage.getItem("events_pref_location") || "");
      setInterests(localStorage.getItem("events_pref_interests") || "");
    }
  }, []);

  useEffect(() => {
    const query =
      interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)[0] || "activities";
    const loc = location || "";
    setLoading(true);
    fetch(
      `/api/events?query=${encodeURIComponent(
        query,
      )}&location=${encodeURIComponent(loc)}`,
    )
      .then((r) => r.json())
      .then((res) => {
        setEvents(res.events || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location, interests]);

  const grouped = useMemo(() => groupEventsByDate(events), [events]);

  return (
    <div className="min-h-screen text-zinc-50">
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 shadow-sm shadow-blue-500/40" />
          <span className="font-semibold text-sm sm:text-base tracking-tight">
            Activities &amp; Events
          </span>
        </Link>
        <div className="flex gap-2">
          <Link
            href="/discover"
            className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-white/10 transition"
          >
            Discover
          </Link>
          <Link
            href="/calendar"
            className="hidden sm:inline-flex items-center rounded-full border border-blue-400/60 bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-100 shadow-sm shadow-blue-500/40"
          >
            Calendar
          </Link>
          <Link
            href="/listings/new"
            className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-blue-500/40 hover:bg-blue-400 transition"
          >
            + New listing
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Calendar
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              A date-first view of upcoming events that match your saved
              preferences.
            </p>
          </div>
          <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-200">
            {location ? (
              <>
                Using location <span className="font-semibold">{location}</span>
              </>
            ) : (
              <>Set your location on the home page for sharper results.</>
            )}
          </div>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-xs text-zinc-500">
            No events yet. Try updating your interests and location on the home
            page, then refresh this view after running the scraper.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((day) => (
              <section
                key={day.key}
                className="rounded-2xl border border-white/10 bg-black/60 p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-zinc-100">
                    {day.label}
                  </p>
                  {day.key !== "unscheduled" && (
                    <span className="text-[10px] text-zinc-500">
                      {new Date(day.key).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <ul className="space-y-2">
                  {day.events.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-xl border border-white/10 bg-zinc-900/60 p-3"
                    >
                      <p className="text-xs font-medium text-zinc-50">
                        {e.title}
                      </p>
                      {e.description && (
                        <p className="mt-1 text-[11px] text-zinc-400 line-clamp-3">
                          {e.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>
                          {e.city && (
                            <>
                              {e.city}
                              {" · "}
                            </>
                          )}
                          {e.source === "db" || e.source === "web"
                            ? "Scraped"
                            : "Sample"}
                        </span>
                        {e.url && e.url !== "#" && (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
