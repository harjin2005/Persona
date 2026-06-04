#!/usr/bin/env python3
"""
Hallucination + retrieval eval for the chat API.
Usage: python scripts/evals/eval_chat.py --url https://your-app.vercel.app
"""
import argparse
import json
import time
from pathlib import Path
import requests
from dotenv import load_dotenv
import os
from groq import Groq

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

JUDGE_PROMPT = """You are evaluating an AI assistant's answer for factual accuracy about a person named Harjinder Singh.

Question: {question}
Expected keywords (at least one must appear): {keywords}
AI Answer: {answer}

Score:
- factual_score: 0.0–1.0 (1.0 = accurate and grounded; 0.0 = hallucinated or wrong)
- keyword_hit: true if at least one expected keyword appears (case-insensitive)
- reasoning: one sentence

Respond as JSON only: {{"factual_score": 0.9, "keyword_hit": true, "reasoning": "..."}}"""


def judge_answer(question: str, keywords: list, answer: str, groq_client: Groq) -> dict:
    resp = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            question=question,
            keywords=", ".join(keywords),
            answer=answer,
        )}],
        temperature=0.0,
        max_tokens=200,
    )
    try:
        text = resp.choices[0].message.content.strip()
        # Extract JSON from response
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except Exception:
        return {"factual_score": 0.0, "keyword_hit": False, "reasoning": "Parse error"}


def run_eval(base_url: str) -> dict:
    qa_path = Path(__file__).parent / "golden_qa.json"
    qa_data = json.loads(qa_path.read_text())["qa_pairs"]
    groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])

    results = []
    latencies = []

    for qa in qa_data:
        start = time.time()
        resp = requests.post(
            f"{base_url}/api/chat",
            json={"messages": [{"role": "user", "content": qa["question"]}]},
            stream=True,
            timeout=30,
        )

        answer = ""
        first_token_time = None
        for chunk in resp.iter_content(chunk_size=None):
            if first_token_time is None:
                first_token_time = time.time()
            answer += chunk.decode("utf-8", errors="ignore")

        total_latency_ms = (time.time() - start) * 1000
        ttft_ms = ((first_token_time or time.time()) - start) * 1000
        latencies.append(total_latency_ms)

        verdict = judge_answer(qa["question"], qa["expected_keywords"], answer, groq_client)
        results.append({
            "id": qa["id"],
            "question": qa["question"],
            "answer_snippet": answer[:200],
            "total_latency_ms": round(total_latency_ms),
            "ttft_ms": round(ttft_ms),
            **verdict,
        })

        status = "✓" if verdict["keyword_hit"] else "✗"
        print(f"  {qa['id']}: score={verdict['factual_score']:.1f} {status} ttft={ttft_ms:.0f}ms")
        time.sleep(0.3)

    total = len(results)
    hallucinated = [r for r in results if r["factual_score"] < 0.5]
    keyword_hits = [r for r in results if r["keyword_hit"]]

    summary = {
        "total_questions": total,
        "hallucination_rate": round(len(hallucinated) / total, 3),
        "keyword_hit_rate": round(len(keyword_hits) / total, 3),
        "avg_factual_score": round(sum(r["factual_score"] for r in results) / total, 3),
        "avg_total_latency_ms": round(sum(latencies) / len(latencies)),
        "p95_latency_ms": round(sorted(latencies)[int(0.95 * len(latencies))]),
        "avg_ttft_ms": round(sum(r["ttft_ms"] for r in results) / total),
        "results": results,
    }

    out_path = Path(__file__).parent / "eval_results.json"
    out_path.write_text(json.dumps(summary, indent=2))
    print(f"\nSaved to {out_path}")
    print(f"Hallucination rate: {summary['hallucination_rate']:.1%}")
    print(f"Keyword hit rate:   {summary['keyword_hit_rate']:.1%}")
    print(f"Avg factual score:  {summary['avg_factual_score']:.2f}")
    print(f"Avg TTFT:           {summary['avg_ttft_ms']}ms")

    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:3000")
    args = parser.parse_args()
    run_eval(args.url)
