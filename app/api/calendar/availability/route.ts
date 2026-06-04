import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/calcom";

export async function GET() {
  try {
    const slots = await getAvailableSlots(7);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("Calendar availability error:", err);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
