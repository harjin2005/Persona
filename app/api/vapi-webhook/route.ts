import { NextRequest, NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag";
import { getAvailableSlots, bookMeeting } from "@/lib/calcom";

type ToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const msgType = body?.message?.type;

  if (msgType === "tool-calls") {
    const results = await Promise.all(
      (body.message.toolCallList as ToolCall[]).map(async (toolCall) => {
        const args = JSON.parse(toolCall.function.arguments || "{}");

        if (toolCall.function.name === "get_knowledge") {
          const context = await retrieveContext(args.query);
          return {
            toolCallId: toolCall.id,
            result: context || "I don't have specific information on that topic.",
          };
        }

        if (toolCall.function.name === "check_availability") {
          const slots = await getAvailableSlots(7);
          if (!slots.length) {
            return { toolCallId: toolCall.id, result: "No slots available in the next 7 days." };
          }
          const slotList = slots
            .slice(0, 4)
            .map((s, i) => `Option ${i + 1}: ${s.label} (${s.time})`)
            .join("\n");
          return { toolCallId: toolCall.id, result: slotList };
        }

        if (toolCall.function.name === "book_meeting") {
          try {
            const result = await bookMeeting({
              slotTime: args.slot_time,
              guestName: args.guest_name,
              guestEmail: args.guest_email,
            });
            return {
              toolCallId: toolCall.id,
              result: `Meeting booked! Confirmation ID: ${result.uid}. You'll receive an email confirmation shortly.`,
            };
          } catch (err) {
            return {
              toolCallId: toolCall.id,
              result: `Booking failed. Please try the chat at ${process.env.NEXT_PUBLIC_APP_URL}`,
            };
          }
        }

        return { toolCallId: toolCall.id, result: "Unknown tool." };
      })
    );

    return NextResponse.json({ results });
  }

  return NextResponse.json({ received: true });
}
