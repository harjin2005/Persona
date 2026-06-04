const CAL_BASE = "https://api.cal.com/v1";
const API_KEY = process.env.CALCOM_API_KEY!;
const USERNAME = process.env.CALCOM_USERNAME!;
const EVENT_TYPE_ID = Number(process.env.CALCOM_EVENT_TYPE_ID!);

export type Slot = {
  time: string;
  label: string;
};

export async function getAvailableSlots(daysAhead = 7): Promise<Slot[]> {
  const dateFrom = new Date();
  const dateTo = new Date();
  dateTo.setDate(dateTo.getDate() + daysAhead);

  const params = new URLSearchParams({
    apiKey: API_KEY,
    username: USERNAME,
    eventTypeId: String(EVENT_TYPE_ID),
    dateFrom: dateFrom.toISOString().split("T")[0],
    dateTo: dateTo.toISOString().split("T")[0],
    timeZone: "Asia/Kolkata",
  });

  const resp = await fetch(`${CAL_BASE}/slots?${params}`);
  if (!resp.ok) throw new Error(`Cal.com slots error: ${resp.status}`);

  const data = await resp.json();
  const slots: Slot[] = [];

  for (const times of Object.values(
    data.slots as Record<string, Array<{ time: string }>>
  )) {
    for (const slot of (times as Array<{ time: string }>).slice(0, 3)) {
      const d = new Date(slot.time);
      slots.push({
        time: slot.time,
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
    responses: {
      name: params.guestName,
      email: params.guestEmail,
      notes: params.notes ?? "",
    },
    timeZone: "Asia/Kolkata",
    language: "en",
    metadata: {},
  };

  const resp = await fetch(`${CAL_BASE}/bookings?apiKey=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Cal.com booking error: ${resp.status} — ${err}`);
  }

  const data = await resp.json();
  return {
    uid: data.uid,
    meetingUrl: data.videoCallData?.url,
  };
}
