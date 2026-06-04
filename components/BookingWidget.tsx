"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, CheckCircle2 } from "lucide-react";

type Slot = { time: string; label: string };
type Step = "slots" | "form" | "confirmed";

export function BookingWidget({ onBook }: { onBook?: (uid: string) => void }) {
  const [step, setStep] = useState<Step>("slots");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/calendar/availability")
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setError("Could not load slots"));
  }, []);

  const handleBook = async () => {
    if (!selected || !name || !email) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotTime: selected.time, guestName: name, guestEmail: email }),
      });
      const data = await resp.json();
      if (data.success) {
        setUid(data.uid);
        setStep("confirmed");
        onBook?.(data.uid);
      } else {
        setError(data.error ?? "Booking failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirmed") {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">Meeting booked!</p>
          <p className="text-sm text-gray-500 mt-1">
            Confirmation sent to <strong>{email}</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">Booking ID: {uid.slice(0, 8)}...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4 text-blue-600" />
          Book a call with Harjinder
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "slots" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-3">Available slots (IST) — next 7 days:</p>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {slots.length === 0 && !error ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading availability...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.slice(0, 6).map((s) => (
                  <button
                    key={s.time}
                    onClick={() => { setSelected(s); setStep("form"); }}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors font-medium text-gray-700"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {step === "form" && selected && (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-700 font-medium">Selected: {selected.label}</p>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Input
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Your work email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setStep("slots")} className="flex-1">
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleBook}
                disabled={loading || !name || !email}
                className="flex-1"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
