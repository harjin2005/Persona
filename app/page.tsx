import { ChatInterface } from "@/components/ChatInterface";
import { BookingWidget } from "@/components/BookingWidget";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Harjinder Singh</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI Automation Engineer · IIT Madras CS · Bengaluru
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            <Badge variant="secondary">Multi-Agent Systems</Badge>
            <Badge variant="secondary">LangChain · LangGraph</Badge>
            <Badge variant="secondary">RAG Pipelines</Badge>
            <Badge variant="secondary">FastAPI · Django</Badge>
            <Badge variant="secondary">n8n Automation</Badge>
          </div>
        </div>
      </div>

      <ChatInterface />

      <div className="max-w-2xl mx-auto mt-6">
        <BookingWidget />
      </div>

      <div className="max-w-2xl mx-auto mt-6 text-center text-xs text-gray-400">
        <p>
          RAG-grounded on resume + 10 GitHub repos ·{" "}
          <a
            href="https://github.com/harjin2005"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            github.com/harjin2005
          </a>
        </p>
      </div>
    </main>
  );
}
