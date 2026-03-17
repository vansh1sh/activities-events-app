"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Discover() {
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [events, setEvents] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocation(localStorage.getItem("events_pref_location") || "");
      setInterests(localStorage.getItem("events_pref_interests") || "");
    }
  }, []);

  useEffect(() => {
    const query = interests.split(",").map((s) => s.trim()).filter(Boolean)[0] || "activities";
    const loc = location || "";
    Promise.all([
      fetch(`/api/events?query=${encodeURIComponent(query)}&location=${encodeURIComponent(loc)}`).then((r) => r.json()),
      fetch("/api/listings").then((r) => r.json()),
    ])
      .then(([eventsRes, listingsRes]) => {
        setEvents(eventsRes.events || []);
        setListings(listingsRes.listings || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location, interests]);

  const normalizedInterests = interests
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const filteredListings = listings.filter((l) => {
    const matchesType = selectedType === "all" || l.type === selectedType;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      l.title.toLowerCase().includes(term) ||
      (l.description || "").toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  const filteredEvents = events.filter((e) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      e.title.toLowerCase().includes(term) ||
      (e.description || "").toLowerCase().includes(term)
    );
  });

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
            className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-white/10 transition"
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

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Discover</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Events from the web plus community listings that match your saved
              preferences.
            </p>
          </div>
          <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-200">
            {location ? (
              <>
                Showing results near <span className="font-semibold">{location}</span>
              </>
            ) : (
              <>No location set yet — set it on the home page for better matches.</>
            )}
          </div>
        </header>

        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["all", "tennis", "concert", "sports", "hiking", "other"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    selectedType === type
                      ? "bg-blue-500 text-white shadow-sm shadow-blue-500/40"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {type === "all" ? "All types" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description…"
                className="w-40 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none sm:w-56"
              />
            </div>
          </div>
          {normalizedInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-400">
              <span className="text-zinc-500">Your interests:</span>
              {normalizedInterests.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-white/5 px-2 py-0.5 text-zinc-200 border border-white/10"
                >
                  {i}
                </span>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section>
              <h2 className="text-xs font-medium text-zinc-400 mb-2">
                Events near you
              </h2>
              {filteredEvents.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No events found. Try updating your interests on the home page or
                  clearing the search.
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredEvents.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-xl border border-white/10 bg-black/60 p-4"
                    >
                      <p className="font-medium text-sm">{e.title}</p>
                      {e.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {e.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>
                          Source:{" "}
                          <span className="font-medium">
                            {e.source === "web" ? "Web search" : "Sample"}
                          </span>
                        </span>
                        {e.url && e.url !== "#" && (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View source
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xs font-medium text-zinc-400 mb-2">
                Community listings
              </h2>
              {filteredListings.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No community listings yet. Be the first to{" "}
                  <Link
                    href="/listings/new"
                    className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
                  >
                    create one
                  </Link>
                  .
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredListings.map((l) => (
                    <li
                      key={l.id}
                      className="rounded-xl border border-white/10 bg-black/60 p-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[11px] capitalize text-zinc-300 border border-white/10">
                          {l.type}
                        </span>
                        {l.createdAt && (
                          <span className="text-[10px] text-zinc-500">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium">{l.title}</p>
                      {l.description && (
                        <p className="text-xs text-zinc-400 mt-1">
                          {l.description}
                        </p>
                      )}
                      {l.contact && (
                        <p className="text-[11px] text-zinc-500 mt-2">
                          Contact: <span className="font-medium">{l.contact}</span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
