import { NextResponse } from "next/server";

// In-memory store for user listings (resets on serverless cold start).
// For production, replace with Vercel KV, Supabase, or a database.
let userListings = [];

export async function GET() {
  return NextResponse.json({ listings: userListings });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, type, contact } = body;
    if (!title || !type) {
      return NextResponse.json(
        { error: "title and type are required" },
        { status: 400 }
      );
    }
    const listing = {
      id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      description: description || "",
      type: type || "other",
      contact: contact || "",
      createdAt: new Date().toISOString(),
    };
    userListings.push(listing);
    return NextResponse.json(listing);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
