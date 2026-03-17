"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");

  const savePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("events_pref_location", location);
      localStorage.setItem("events_pref_interests", interests);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          Activities & Events
        </Link>
        <div className="flex gap-3">
          <Link
            href="/discover"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            Discover
          </Link>
          <Link
            href="/listings/new"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            Create listing
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">Set your preferences</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          We’ll use these to show you activities and events in your area.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location (city or area)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={savePreferences}
              placeholder="e.g. San Francisco"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Interests (comma-separated)</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              onBlur={savePreferences}
              placeholder="e.g. tennis, concerts, hiking"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            />
          </div>
          <Link
            href="/discover"
            onClick={savePreferences}
            className="inline-block rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            See what’s on
          </Link>
        </div>
      </main>
    </div>
  );
}
