"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MessageList, Message } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";

let msgId = 0;
const nextId = () => String(++msgId);

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = { id: nextId(), role: "user", content: text };
      const assistantMsg: Message = { id: nextId(), role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      try {
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!resp.body) throw new Error("No response body");
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m
            )
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Sorry, I encountered an error. Please try again." }
              : m
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [messages]
  );

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-xl shadow-sm bg-white overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          H
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Harjinder Singh — AI Assistant</h2>
          <p className="text-xs text-gray-500">RAG-grounded · Evidence-backed · Book a call below</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 overflow-y-auto">
        <MessageList messages={messages} />
        <div ref={bottomRef} />
      </ScrollArea>
      <MessageInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
