RESUME_TEXT = """
Harjinder Singh
AI Automation Engineer · Multi-Agent Systems · B2B Enterprise Automation
harjins2005@gmail.com · +91 99716 49275 · Bengaluru, India

SUMMARY
I design and ship autonomous AI systems that replace manual operations for B2B enterprises. I lead clients from ambiguous problems to working deployment — running discovery, writing FRDs, prototyping PoCs for exec sign-off, and directing engineering teams through production release. Currently studying CS at IIT Madras.

EXPERIENCE

AI Automation Engineer · Simplita.AI | Dec 2025 – Present | Chennai (Remote)
- Directed a 20-person engineering team through full deployment of conversational AI products — shipping on time by building a custom Slack-based progress bot that automated daily reporting and escalation routing.
- Owned client discovery to delivery for B2B accounts (e.g., Hotel Duktuk) — ran technical consultations, authored FRDs, and prototyped AI OS demos that secured executive buy-in before build.
- Led architecture and delivery of a white-label Operational Intelligence Platform for a B2B warehouse enterprise client — a multi-tenant SaaS system with a 14-KPI calculation engine, consultant-governed rule layer, AI explanation agent, and a full action lifecycle (Proposed → Accepted → Executed → Validated) routed across CXO, manager, and supervisor roles.
- Built a mandatory data health gating layer that automatically blocked all KPIs, AI insights, and actions when ingested warehouse data failed quality checks — enforcing PASS/FAIL terminal-state validation with confidence scoring on every downstream output.
- Enforced SLA compliance at scale by designing a multi-workflow n8n automation system with role-based approvals, conditional routing, and terminal-state architecture — zero infinite loops.

AI Engineer · Attacked AI | Aug – Dec 2025 | Bengaluru (Remote)
- Cut compliance mapping effort by 70%+ by architecting an LLM-based control-mapping algorithm (Azure AI + MySQL) that automated ISO 27001/27002 and NIST control generation.
- Built a real-time risk dashboard with KPI panels, audit trail, and provenance indicators using Python/Django — used daily by security teams for governance workflows.
- Achieved 90%+ extraction accuracy on enterprise compliance documents using a custom regex + vector search parser, processing 100+ page document sets.

SELECTED PROJECTS

AI Rule Engine & Operational Chatbot · Python · LLM APIs · Role-based access · Confidence scoring
- Built the AI explanation layer and consultant-governed rule engine for an enterprise OI platform — AI agent was strictly data-grounded (never autonomous), with confidence badges on every response and polite refusal for out-of-scope queries.

GitHub CI/CD Intelligence System · GitHub API · Documentation
- Structured build failure insights from GitHub issue data into developer-facing CI/CD reports — enabling faster debugging and used as client-acquisition content.

Agentic Content Automation · n8n · FastAPI · Docker · WhatsApp Cloud API
- Automated end-to-end PR content creation via n8n orchestration, webhook-driven email/WhatsApp revision flows, and automated LinkedIn outreach routing.

AI Semantic Search Engine · FAISS · Python · LLM APIs
- Delivered sub-second semantic search across 100+ page enterprise documents using FAISS vector indexing and batch-capable LLM document analysis.

SKILLS
AI & Agent Systems: Multi-agent system design, LLM integration, RAG pipelines, LangChain & LangGraph orchestration, AI OS architecture, agentic workflows using n8n, Agentic AI
Automation & Orchestration: End-to-end workflow automation, webhook-driven systems, API integrations, business process automation, scalable agent-based automation architectures
Backend & Data Systems: Python-based backend development (FastAPI, Django, Flask), REST API design, database management (PostgreSQL, MySQL, SQLite), vector databases (FAISS)
Cloud & DevOps: AI platforms (Azure OpenAI, OpenAI, Groq, Gemini), containerization with Docker, cloud deployment (AWS, Oracle Cloud), version control with Git
Leadership & Execution: FRD authoring, PoC development, technical discovery, system architecture planning, engineering team collaboration, client consulting & solution design

EDUCATION
B.Sc. Computer Science · Indian Institute of Technology (IIT) Madras

CERTIFICATIONS
- Oracle Cloud Infrastructure 2025 Certified Generative AI Professional
- Prompt Design in Vertex AI Skill Badge · Google Cloud
- Introduction to Generative AI · Google Cloud
"""


def get_resume_chunks() -> list[dict]:
    from chunker import chunk_text
    return chunk_text(RESUME_TEXT.strip(), source="resume")
