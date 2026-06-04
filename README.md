# Harjinder Singh — AI Persona

> AI representative of Harjinder Singh for the Scaler AI Engineer screening.  
> Call it · Chat with it · Book an interview — no human in the loop.

## Live

| Channel | Link |
|---------|------|
| **Chat** | *(add Vercel URL after deploy)* |
| **Voice** | *(add Vapi phone number after setup)* |
| **GitHub** | [github.com/harjin2005](https://github.com/harjin2005) |

---

## Architecture

```mermaid
graph TB
    subgraph Inbound
        CALL[Phone Call]
        CHAT[Chat UI]
    end

    subgraph Voice["Voice Pipeline — Vapi.ai"]
        VAPI[Vapi Agent<br/>Deepgram STT · PlayHT TTS]
    end

    subgraph App["Next.js on Vercel — serverless, never sleeps"]
        UI[Chat UI]
        CHAT_API[/api/chat — Streaming RAG]
        WEBHOOK[/api/vapi-webhook — Tool Handler]
        CAL_API[/api/calendar — Availability + Book]
    end

    subgraph Knowledge["Knowledge Base — Supabase pgvector"]
        VEC[(pgvector — 53 chunks, 1536-dim)]
        RESUME[Resume — 8 chunks]
        GITHUB[GitHub READMEs — 10 repos, 45 chunks]
    end

    subgraph LLM["LLM Layer"]
        GROQ[Groq llama-3.3-70b — free, 500 tok/s]
        OAI[OpenAI text-embedding-3-small]
    end

    subgraph Cal["Calendar — Cal.com"]
        CALCOM[Cal.com API — real availability + booking]
    end

    CALL --> VAPI --> WEBHOOK
    CHAT --> UI --> CHAT_API
    CHAT_API --> OAI --> VEC --> GROQ --> CHAT_API
    WEBHOOK --> OAI
    WEBHOOK --> VEC
    WEBHOOK --> GROQ
    WEBHOOK --> CAL_API --> CALCOM
    CHAT_API --> CAL_API
    RESUME --> VEC
    GITHUB --> VEC
```

---

## Stack + Cost

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend + API routes | Next.js 14 App Router, Vercel | **Free** |
| LLM | Groq llama-3.3-70b | **Free** |
| Embeddings | OpenAI text-embedding-3-small | ~$0.001/session |
| Vector DB | Supabase pgvector (500MB free tier) | **Free** |
| Voice agent | Vapi.ai | ~$0.05/min |
| Calendar | Cal.com free tier | **Free** |
| TTS | PlayHT via Vapi | Included |
| STT | Deepgram Nova-2 via Vapi | Included |

**Per voice call (5 min avg):** ~$0.25  
**Per chat session (10 messages avg):** ~$0.002

---

## Setup

### Prerequisites

- Node.js 18+, Python 3.11+
- Accounts: [Supabase](https://supabase.com), [OpenAI](https://platform.openai.com), [Groq](https://console.groq.com), [Vapi](https://vapi.ai), [Cal.com](https://cal.com), [Vercel](https://vercel.com)

### 1. Clone + Install

```bash
git clone https://github.com/harjin2005/harjinder-ai-persona
cd harjinder-ai-persona
npm install
cp .env.example .env.local
# Fill in all API keys in .env.local
```

### 2. Supabase: Run Migration

Open Supabase Dashboard → SQL Editor → paste and run `supabase/migrations/001_embeddings.sql`

### 3. Ingest Knowledge Base

```bash
pip install -r scripts/requirements.txt
python scripts/ingest.py
# Expected output: ~53 chunks stored (8 resume + 45 GitHub)
```

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

Test the chat API:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Why should Scaler hire Harjinder?"}]}'
```

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Add all env vars from .env.example in Vercel Dashboard
```

### 6. Configure Vapi Voice Agent

Update `REPLACE_WITH_VERCEL_URL` in `vapi/assistant-config.json` with your Vercel URL, then:

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vapi/assistant-config.json
```

Assign the assistant to your Vapi phone number in the Vapi Dashboard → Phone Numbers.

### 7. Run Evals

```bash
pip install -r scripts/evals/requirements.txt

# Chat hallucination + retrieval eval
python scripts/evals/eval_chat.py --url https://YOUR_VERCEL_URL

# Voice webhook latency eval
python scripts/evals/eval_voice.py --url https://YOUR_VERCEL_URL

# Generate 1-page PDF report
python scripts/evals/generate_report.py
# Output: eval_report.pdf in project root
```

---

## RAG Corpus

| Source | Chunks | Content |
|--------|--------|---------|
| Resume | 8 | Experience, skills, education, certifications |
| AI-Tutor-Orchestrator | ~5 | LangGraph multi-agent tutoring system |
| Guard-Objective-Automation | ~5 | Django + Azure OpenAI cybersecurity |
| automated_fallout | ~4 | AI crisis response platform |
| AI-Engineer-Projects | ~4 | Multi-agent portfolio (LangChain) |
| ai-chatbot | ~4 | Next.js AI chat template |
| ai_projects | ~5 | ML portfolio (PyTorch, LSTM) |
| CI-CD-HEALING-AGENT | ~4 | GitHub CI/CD intelligence |
| AI-Market-analyser-VAIA | ~4 | Market analysis AI |
| AI_Doctor_receptionist | ~3 | Healthcare AI bot |
| Emergent_Ci_CD | ~3 | CI/CD workflow automation |

---

## File Structure

```
harjinder-ai-persona/
├── app/
│   ├── page.tsx                    # Chat UI + booking widget
│   ├── layout.tsx
│   └── api/
│       ├── chat/route.ts           # Streaming RAG endpoint
│       ├── vapi-webhook/route.ts   # Vapi tool handler
│       ├── calendar/availability/  # Cal.com slot fetching
│       ├── calendar/book/          # Cal.com booking
│       └── health/route.ts
├── components/
│   ├── ChatInterface.tsx           # Streaming chat orchestrator
│   ├── MessageList.tsx
│   ├── MessageInput.tsx
│   └── BookingWidget.tsx           # Slot picker + booking form
├── lib/
│   ├── rag.ts                      # Supabase vector search
│   ├── calcom.ts                   # Cal.com API client
│   └── groq.ts                     # Groq client singleton
├── scripts/
│   ├── ingest.py                   # RAG ingestion orchestrator
│   ├── github_crawler.py           # GitHub repo README crawler
│   ├── resume_parser.py            # Resume text chunks
│   ├── chunker.py                  # Token-based overlap chunking
│   ├── embedder.py                 # OpenAI embed + Supabase upsert
│   └── evals/
│       ├── golden_qa.json          # 20 ground-truth Q&A pairs
│       ├── eval_chat.py            # Hallucination + retrieval eval
│       ├── eval_voice.py           # Voice webhook latency eval
│       └── generate_report.py     # 1-page PDF report generator
├── supabase/migrations/
│   └── 001_embeddings.sql          # pgvector table + match function
├── vapi/
│   └── assistant-config.json       # Vapi assistant definition
├── eval_report.pdf                 # Generated eval report
└── .env.example                    # All required env vars
```

---

## Eval Results

See `eval_report.pdf` in repo root — generated by `python scripts/evals/generate_report.py` after running eval scripts against the deployed app.

---

Built by [Harjinder Singh](mailto:harjins2005@gmail.com) · [github.com/harjin2005](https://github.com/harjin2005)
