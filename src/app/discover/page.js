"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Discover() {
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [events, setEvents] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          Activities & Events
        </Link>
        <div className="flex gap-3">
          <Link href="/discover" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
            Discover
          </Link>
          <Link href="/listings/new" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
            Create listing
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">Discover</h1>
        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : (
          <div className="space-y-6">
            {listings.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Community listings</h2>
                <ul className="space-y-3">
                  {listings.map((l) => (
                    <li
                      key={l.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900"
                    >
                      <span className="text-xs text-zinc-500 capitalize">{l.type}</span>
                      <p className="font-medium">{l.title}</p>
                      {l.description && <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{l.description}</p>}
                      {l.contact && <p className="text-xs text-zinc-500 mt-1">Contact: {l.contact}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Events near you</h2>
              {events.length === 0 ? (
                <p className="text-zinc-500 text-sm">No events found. Try updating your interests on the home page.</p>
              ) : (
                <ul className="space-y-3">
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900"
                    >
                      <p className="font-medium">{e.title}</p>
                      {e.description && <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">{e.description}</p>}
                      {e.url && e.url !== "#" && (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block"
                        >
                          View source
                        </a>
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
