const CAL_BASE = "https://api.cal.com/v2";
const API_KEY = process.env.CALCOM_API_KEY!;
const EVENT_TYPE_ID = Number(process.env.CALCOM_EVENT_TYPE_ID!);

const CAL_HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  "cal-api-version": "2024-09-04",
  "Content-Type": "application/json",
};

export type Slot = {
  time: string;
  label: string;
};

export async function getAvailableSlots(daysAhead = 7): Promise<Slot[]> {
  const start = new Date().toISOString();
  const end = new Date(Date.now() + daysAhead * 86400000).toISOString();

  const params = new URLSearchParams({
    eventTypeId: String(EVENT_TYPE_ID),
    start,
    end,
  });

  const resp = await fetch(`${CAL_BASE}/slots?${params}`, { headers: CAL_HEADERS });
  if (!resp.ok) throw new Error(`Cal.com slots error: ${resp.status}`);

  const json = await resp.json();
  const slotsData = json.data as Record<string, Array<{ start: string }>>;
  const slots: Slot[] = [];

  for (const daySlots of Object.values(slotsData)) {
    for (const slot of daySlots.slice(0, 3)) {
      const d = new Date(slot.start);
      slots.push({
        time: slot.start,
        label: d.toLocaleString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }),
      });
    }
    if (slots.length >= 6) break;
  }

  return slots;
}

export async function bookMeeting(params: {
  slotTime: string;
  guestName: string;
  guestEmail: string;
  notes?: string;
}): Promise<{ uid: string; meetingUrl?: string }> {
  const body = {
    eventTypeId: EVENT_TYPE_ID,
    start: params.slotTime,
    attendee: {
      name: params.guestName,
      email: params.guestEmail,
      timeZone: "Asia/Kolkata",
    },
    metadata: {},
  };

  const resp = await fetch(`${CAL_BASE}/bookings`, {
    method: "POST",
    headers: { ...CAL_HEADERS, "cal-api-version": "2024-08-13" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Cal.com booking error: ${resp.status} — ${err}`);
  }

  const data = await resp.json();
  return {
    uid: data.data?.uid ?? data.uid,
    meetingUrl: data.data?.meetingUrl,
  };
}
