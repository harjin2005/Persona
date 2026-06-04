import { NextRequest, NextResponse } from "next/server";
import { bookMeeting } from "@/lib/calcom";

export async function POST(req: NextRequest) {
  try {
    const { slotTime, guestName, guestEmail, notes } = await req.json();

    if (!slotTime || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: "slotTime, guestName, and guestEmail are required" },
        { status: 400 }
      );
    }

    const result = await bookMeeting({ slotTime, guestName, guestEmail, notes });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
