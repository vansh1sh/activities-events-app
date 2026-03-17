"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListing() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("other");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, contact }),
      });
      if (res.ok) router.push("/discover");
      else alert("Something went wrong.");
    } finally {
      setSubmitting(false);
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
            href="/listings/new"
            className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-blue-500/40 hover:bg-blue-400 transition"
          >
            + New listing
          </Link>
        </div>
      </nav>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start">
        <section className="w-full lg:w-1/2 space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create a community listing
          </h1>
          <p className="text-sm text-zinc-300">
            Share a game, meetup, or event you&apos;re organizing or looking to
            join. Listings show up in Discover for anyone with matching
            interests.
          </p>
          <ul className="mt-3 space-y-2 text-xs text-zinc-400">
            <li>• Be specific with time and location in the description.</li>
            <li>• Use the contact field so people can actually reach you.</li>
            <li>• You can always post multiple listings for different days.</li>
          </ul>
        </section>

        <section className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-xl shadow-blue-500/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunday tennis – need 2 more players"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="tennis">Tennis</option>
                  <option value="concert">Concert</option>
                  <option value="sports">Sports</option>
                  <option value="hiking">Hiking</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Description <span className="text-[11px] text-zinc-500">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="When, where, who you’re looking for, and any details people should know."
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Contact <span className="text-[11px] text-zinc-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Slack handle, email, or phone"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/40 hover:bg-blue-400 disabled:opacity-60 transition"
              >
                {submitting ? "Posting…" : "Post listing"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
