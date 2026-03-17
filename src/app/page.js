"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");

  const quickChips = [
    "tennis",
    "concerts",
    "hiking",
    "food festivals",
    "tech meetups",
    "art shows",
  ];

  const savePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("events_pref_location", location);
      localStorage.setItem("events_pref_interests", interests);
    }
  };

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

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
        <section className="w-full lg:w-1/2 space-y-4">
          <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Find something to do this week
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Activities near you,
            <br />
            without endless scrolling.
          </h1>
          <p className="max-w-md text-sm text-zinc-300">
            Save your location and interests once. We&apos;ll pull in events
            from the web and community listings tailored to you.
          </p>

          <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-zinc-400">This weekend</p>
              <p className="mt-1 text-sm font-medium">Tennis meetup, park run</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Next 7 days</p>
              <p className="mt-1 text-sm font-medium">
                12 things that match your interests
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Your picks</p>
              <p className="mt-1 text-sm font-medium">Save &amp; share listings</p>
            </div>
          </div>
        </section>

        <section className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-xl shadow-blue-500/10">
            <h2 className="text-sm font-semibold mb-1">Set your preferences</h2>
            <p className="text-xs text-zinc-400 mb-4">
              We&apos;ll use these to show you activities and events in your area.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Location (city or area)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={savePreferences}
                  placeholder="e.g. San Francisco, Bandra, Indiranagar"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Interests
                  <span className="ml-1 text-[11px] font-normal text-zinc-500">
                    (comma-separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  onBlur={savePreferences}
                  placeholder="e.g. tennis, concerts, hiking"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {quickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const current = interests
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        if (!current.includes(chip)) {
                          const next = [...current, chip].join(", ");
                          setInterests(next);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("events_pref_interests", next);
                          }
                        }
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-200 hover:bg-white/10 transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
              <Link
                href="/discover"
                onClick={savePreferences}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/40 hover:bg-blue-400 transition"
              >
                See what&apos;s on near you
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
