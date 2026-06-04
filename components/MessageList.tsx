"use client";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-4 py-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg font-semibold text-gray-600">Hi, I&apos;m Harjinder&apos;s AI assistant.</p>
          <p className="text-sm mt-2">Ask about his background, projects, or book a call.</p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {[
              "Why should Scaler hire Harjinder?",
              "Tell me about AI-Tutor-Orchestrator",
              "What's his experience with RAG?",
              "Check availability for a call",
            ].map((q) => (
              <span key={q} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border cursor-default">
                {q}
              </span>
            ))}
          </div>
        </div>
      )}
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-gray-100 text-gray-900 rounded-bl-sm"
            }`}
          >
            {m.content || <span className="opacity-50 italic">thinking...</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
